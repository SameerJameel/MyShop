using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Dtos;
using MyShop.Api.Models;

namespace MyShop.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BalancesController : ControllerBase
{
    private readonly AppDbContext _db;

    public BalancesController(AppDbContext db)
    {
        _db = db;
    }

    // GET: /api/balances/items?search=&categoryId=&onlyInStock=true&sort=value_desc
    [HttpGet("items")]
    public async Task<ActionResult<List<ItemBalanceDto>>> GetItemBalances(
    [FromQuery] string? search,
    [FromQuery] int? categoryId,
    [FromQuery] bool onlyInStock = false,
    [FromQuery] string sort = "value_desc",
    CancellationToken ct = default)
    {
        search = (search ?? "").Trim();
        var q = _db.Items.AsNoTracking().AsQueryable();

        if (categoryId.HasValue && categoryId.Value > 0)
            q = q.Where(i => i.CategoryId == categoryId.Value);

        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(i => i.Name.Contains(search));

        if (onlyInStock)
            q = q.Where(i => i.OnHandQty > 0);

        var movements = _db.StockMovements.AsNoTracking();

        var dataQ =
            from i in q
            join c in _db.Categories.AsNoTracking() on i.CategoryId equals c.Id into cg
            from c in cg.DefaultIfEmpty()
            select new ItemBalanceDto
            {
                ItemId = i.Id,
                ItemName = i.Name,
                Unit = i.Unit,
                CategoryName = c != null ? c.Name : null,
                OnHandQty = i.OnHandQty,
                AvgCost = i.AvgCost,
                StockValue = (decimal)((double)i.OnHandQty * (double)i.AvgCost),
                SalePrice = i.SalePrice,
                LastPurchaseCost = movements
                    .Where(m => m.ItemId == i.Id && m.Type == StockMovementType.PurchaseReceipt)
                    .OrderByDescending(m => m.Date)
                    .Select(m => m.UnitCost)
                    .FirstOrDefault(),
                LastMovementAt = movements
                    .Where(m => m.ItemId == i.Id)
                    .OrderByDescending(m => m.Date)
                    .Select(m => (DateTime?)m.Date)
                    .FirstOrDefault()
            };

        // For decimal-based sorting (qty, value), get data first then sort in memory
        List<ItemBalanceDto> list;

        if (sort.StartsWith("qty_") || sort.StartsWith("value_"))
        {
            // Get unsorted data first
            var tempList = await dataQ.ToListAsync(ct);

            // Sort in memory (supports decimal)
            list = sort switch
            {
                "qty_asc" => tempList.OrderBy(x => x.OnHandQty).ToList(),
                "qty_desc" => tempList.OrderByDescending(x => x.OnHandQty).ToList(),
                "value_asc" => tempList.OrderBy(x => x.StockValue).ToList(),
                "value_desc" => tempList.OrderByDescending(x => x.StockValue).ToList(),
                _ => tempList.OrderByDescending(x => x.StockValue).ToList()
            };
        }
        else
        {
            // String-based sorting can be done in database
            dataQ = sort switch
            {
                "name_asc" => dataQ.OrderBy(x => x.ItemName),
                "name_desc" => dataQ.OrderByDescending(x => x.ItemName),
                _ => dataQ.OrderBy(x => x.ItemName)
            };

            list = await dataQ.ToListAsync(ct);
        }

        return Ok(list);
    }

    // GET: /api/balances/summary
    [HttpGet("summary")]
    public async Task<ActionResult<BalanceSummaryDto>> GetSummary(CancellationToken ct = default)
    {
        // ملاحظة: LowStockCount رح نكمله لما تضيف ReorderLevel على Item
        var items = _db.Items.AsNoTracking();

        // Cast to double for SQLite compatibility
        var totalValue = await items.SumAsync(i => (double)i.OnHandQty * (double)i.AvgCost, ct);
        var totalQty = await items.SumAsync(i => (double)i.OnHandQty, ct);
        var count = await items.CountAsync(ct);

        return Ok(new BalanceSummaryDto
        {
            TotalStockValue = (decimal)totalValue,  // Cast back to decimal
            TotalOnHandQty = (decimal)totalQty,      // Cast back to decimal
            ItemsCount = count,
            LowStockCount = 0
        });
    }
}
