using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;
using MyShop.Api.Services;

namespace MyShop.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly StockService _stock;

        public InventoriesController(AppDbContext context, StockService stock)
        {
            _context = context;
            _stock = stock;
        }

        // POST: api/inventories
        // Creates inventory snapshot + posts stock adjustments (counted - system)
        [HttpPost]
        public async Task<ActionResult<InventoryDetailsDto>> CreateInventory([FromBody] InventoryCreateDto dto, CancellationToken ct)
        {
            if (dto?.Items == null || dto.Items.Count == 0)
                return BadRequest("No items in inventory.");

            // Normalize date
            var invDate = dto.Date == default ? DateTime.UtcNow : dto.Date;

            // Merge duplicates by ItemId (لو الواجهة بعتت نفس الصنف مرتين)
            var grouped = dto.Items
                .GroupBy(x => x.ItemId)
                .Select(g => new
                {
                    ItemId = g.Key,
                    Quantity = g.Sum(x => x.Quantity),
                    // نأخذ آخر قيم وصفية/سعر بيع (أو أولها) حسب ما تحب
                    ItemName = g.Last().ItemName,
                    Unit = g.Last().Unit,
                    CategoryId = g.Last().CategoryId,
                    CategoryName = g.Last().CategoryName,
                    SalePrice = g.Last().SalePrice,
                })
                .ToList();

            // Fetch system quantities/costs for all items
            var itemIds = grouped.Select(x => x.ItemId).Distinct().ToList();

            var items = await _context.Items
                .AsNoTracking()
                .Where(i => itemIds.Contains(i.Id))
                .Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.Unit,
                    i.CategoryId,
                    CategoryName = i.Category != null ? i.Category.Name : null,
                    i.OnHandQty,
                    i.AvgCost
                })
                .ToListAsync(ct);

            var itemsMap = items.ToDictionary(x => x.Id, x => x);

            // Validate missing items
            var missing = itemIds.Where(id => !itemsMap.ContainsKey(id)).ToList();
            if (missing.Count > 0)
                return BadRequest($"Some items not found: {string.Join(", ", missing)}");

            await using var tx = await _context.Database.BeginTransactionAsync(ct);

            var inventory = new Inventory
            {
                Date = invDate,
                Name = string.IsNullOrWhiteSpace(dto.Name)
                    ? $"جرد {invDate:yyyy-MM-dd HH:mm}"
                    : dto.Name.Trim(),
                Notes = dto.Notes,
                CreatedBy = User?.Identity?.Name,
                CreatedAt = DateTime.UtcNow
            };

            decimal totalAtSalePrice = 0m;

            foreach (var it in grouped)
            {
                if (it.Quantity < 0)
                    return BadRequest("Inventory counted quantity cannot be negative.");

                var sys = itemsMap[it.ItemId];

                // Prefer persisted names if dto sent empty (robust)
                var itemName = !string.IsNullOrWhiteSpace(it.ItemName) ? it.ItemName : sys.Name;
                var unit = !string.IsNullOrWhiteSpace(it.Unit) ? it.Unit : sys.Unit;
                var categoryName = !string.IsNullOrWhiteSpace(it.CategoryName) ? it.CategoryName : (sys.CategoryName ?? "");
                var salePrice = it.SalePrice;

                // Snapshot line (اللي رح يظهر في تفاصيل الجرد)
                var lineTotal = it.Quantity * salePrice;
                totalAtSalePrice += lineTotal;

                inventory.Lines.Add(new InventoryLine
                {
                    ItemId = it.ItemId,
                    ItemName = itemName,
                    Unit = unit,
                    CategoryId = it.CategoryId != 0 ? it.CategoryId : sys.CategoryId,
                    CategoryName = categoryName,
                    Quantity = it.Quantity,          // Counted quantity
                    SalePrice = salePrice,
                    TotalPrice = lineTotal
                });

                // ===== Stock Adjustment =====
                // Delta = Counted - System
                var systemQty = sys.OnHandQty;
                var countedQty = it.Quantity;
                var delta = countedQty - systemQty;

                // Ignore tiny decimal drift (إذا بتستخدم 3 منازل)
                if (Math.Abs(delta) < 0.0005m)
                    continue;

                await _stock.PostMovementAsync(new StockMovement
                {
                    ItemId = it.ItemId,
                    Date = invDate,
                    Type = StockMovementType.InventoryAdjustment,
                    Qty = delta, // +/- allowed
                    // للزيادات: نخليه AvgCost الحالي (StockService رح يطبقه)
                    // للنقص: مش مهم
                    UnitCost = sys.AvgCost,
                    InventoryId = null, // لو عندك InventoryId داخل StockMovement وبدك تربطه بعد SaveChanges، بنربطه تحت
                    Notes = $"Inventory adjustment via {inventory.Name}"
                }, ct);
            }

            inventory.TotalAmount = totalAtSalePrice;

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync(ct);

            // لو بدك تربط InventoryId بحركات الجرد بشكل فعلي:
            // (اختياري) نحدّث آخر حركات بنفس التاريخ والنوتس — لكن الأفضل نضيف InventoryId داخل PostMovement (بالمستقبل)
            // حالياً نتركه لتبسيط ومنع التلاعب.

            await tx.CommitAsync(ct);

            // Return details
            var result = new InventoryDetailsDto
            {
                Id = inventory.Id,
                Date = inventory.Date,
                Name = inventory.Name,
                Notes = inventory.Notes,
                TotalAmount = inventory.TotalAmount,
                CreatedBy = inventory.CreatedBy,
                CreatedAt = inventory.CreatedAt,
                Lines = inventory.Lines
                    .OrderBy(l => l.ItemName)
                    .Select(l => new InventoryLineDto
                    {
                        ItemId = l.ItemId,
                        ItemName = l.ItemName,
                        Unit = l.Unit,
                        CategoryName = l.CategoryName,
                        Quantity = l.Quantity,
                        SalePrice = l.SalePrice,
                        TotalPrice = l.TotalPrice
                    })
                    .ToList()
            };

            return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, result);
        }

        // GET: api/inventories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryListDto>>> GetInventories(CancellationToken ct)
        {
            var list = await _context.Inventories
                .AsNoTracking()
                .OrderByDescending(i => i.Date)
                .Select(i => new InventoryListDto
                {
                    Id = i.Id,
                    Date = i.Date,
                    Name = i.Name,
                    TotalAmount = i.TotalAmount,
                    ItemsCount = i.Lines.Count,
                    CreatedBy = i.CreatedBy
                })
                .ToListAsync(ct);

            return Ok(list);
        }

        // GET: api/inventories/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<InventoryDetailsDto>> GetInventory(int id, CancellationToken ct)
        {
            var inventory = await _context.Inventories
                .AsNoTracking()
                .Include(i => i.Lines)
                .FirstOrDefaultAsync(i => i.Id == id, ct);

            if (inventory == null)
                return NotFound();

            var dto = new InventoryDetailsDto
            {
                Id = inventory.Id,
                Date = inventory.Date,
                Name = inventory.Name,
                Notes = inventory.Notes,
                TotalAmount = inventory.TotalAmount,
                CreatedBy = inventory.CreatedBy,
                CreatedAt = inventory.CreatedAt,
                Lines = inventory.Lines
                    .OrderBy(l => l.ItemName)
                    .Select(l => new InventoryLineDto
                    {
                        ItemId = l.ItemId,
                        ItemName = l.ItemName,
                        Unit = l.Unit,
                        CategoryName = l.CategoryName,
                        Quantity = l.Quantity,
                        SalePrice = l.SalePrice,
                        TotalPrice = l.TotalPrice
                    })
                    .ToList()
            };

            return Ok(dto);
        }
    }
}
