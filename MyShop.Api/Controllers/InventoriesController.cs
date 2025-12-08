using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public InventoriesController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/inventories
        [HttpPost]
        public async Task<ActionResult<InventoryDetailsDto>> CreateInventory([FromBody] InventoryCreateDto dto)
        {
            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequest("No items in inventory.");

            var inventory = new Inventory
            {
                Date = dto.Date == default ? DateTime.UtcNow : dto.Date,
                Name = string.IsNullOrWhiteSpace(dto.Name)
                    ? $"جرد {DateTime.UtcNow:yyyy-MM-dd HH:mm}"
                    : dto.Name,
                Notes = dto.Notes,
                CreatedBy = User?.Identity?.Name,
                CreatedAt = DateTime.UtcNow
            };

            decimal total = 0;

            foreach (var it in dto.Items)
            {
                var lineTotal = it.Quantity * it.SalePrice;
                total += lineTotal;

                inventory.Lines.Add(new InventoryLine
                {
                    ItemId = it.ItemId,
                    ItemName = it.ItemName,
                    Unit = it.Unit,
                    CategoryId = it.CategoryId,
                    CategoryName = it.CategoryName,
                    Quantity = it.Quantity,
                    SalePrice = it.SalePrice,
                    TotalPrice = lineTotal
                });
            }

            inventory.TotalAmount = total;

            _context.Inventories.Add(inventory);
            await _context.SaveChangesAsync();

            // نرجّع تفاصيل الجرد الجديد
            var result = new InventoryDetailsDto
            {
                Id = inventory.Id,
                Date = inventory.Date,
                Name = inventory.Name,
                Notes = inventory.Notes,
                TotalAmount = inventory.TotalAmount,
                CreatedBy = inventory.CreatedBy,
                CreatedAt = inventory.CreatedAt,
                Lines = inventory.Lines.Select(l => new InventoryLineDto
                {
                    ItemId = l.ItemId,
                    ItemName = l.ItemName,
                    Unit = l.Unit,
                    CategoryName = l.CategoryName,
                    Quantity = l.Quantity,
                    SalePrice = l.SalePrice,
                    TotalPrice = l.TotalPrice
                }).ToList()
            };

            return CreatedAtAction(nameof(GetInventory), new { id = inventory.Id }, result);
        }

        // GET: api/inventories
        [HttpGet]
        public async Task<ActionResult<IEnumerable<InventoryListDto>>> GetInventories()
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
                .ToListAsync();

            return Ok(list);
        }

        // GET: api/inventories/5
        [HttpGet("{id:int}")]
        public async Task<ActionResult<InventoryDetailsDto>> GetInventory(int id)
        {
            var inventory = await _context.Inventories
                .AsNoTracking()
                .Include(i => i.Lines)
                .FirstOrDefaultAsync(i => i.Id == id);

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
                Lines = inventory.Lines.OrderBy(l => l.ItemName).Select(l => new InventoryLineDto
                {
                    ItemId = l.ItemId,
                    ItemName = l.ItemName,
                    Unit = l.Unit,
                    CategoryName = l.CategoryName,
                    Quantity = l.Quantity,
                    SalePrice = l.SalePrice,
                    TotalPrice = l.TotalPrice
                }).ToList()
            };

            return Ok(dto);
        }
    }
}
