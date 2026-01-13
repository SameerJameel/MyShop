using Microsoft.EntityFrameworkCore;
using MyShop.Api.Data;
using MyShop.Api.Models;

namespace MyShop.Api.Services;

public class StockService
{
    private readonly AppDbContext _db;

    public StockService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<StockMovement> PostMovementAsync(StockMovement m, CancellationToken ct = default)
    {
        if (m.Qty == 0) throw new ArgumentException("Qty cannot be zero.");
        if (m.Date == default) m.Date = DateTime.UtcNow;

        var hasOuterTx = _db.Database.CurrentTransaction != null;

        // افتح Transaction فقط إذا ما فيه Transaction شغال
        await using var tx = hasOuterTx ? null : await _db.Database.BeginTransactionAsync(ct);

        var item = await _db.Items.FirstOrDefaultAsync(x => x.Id == m.ItemId, ct)
                   ?? throw new InvalidOperationException("Item not found.");

        if (m.Qty < 0 && item.OnHandQty + m.Qty < 0)
            throw new InvalidOperationException("Insufficient stock (would go negative).");

        switch (m.Type)
        {
            case StockMovementType.PurchaseReceipt:
                {
                    if (m.Qty <= 0) throw new InvalidOperationException("Purchase receipt must be positive qty.");
                    if (m.UnitCost == null || m.UnitCost < 0) throw new InvalidOperationException("UnitCost is required for purchase receipt.");

                    var oldQty = item.OnHandQty;
                    var oldAvg = item.AvgCost;

                    var newQty = oldQty + m.Qty;
                    var newAvg = (oldQty == 0)
                        ? m.UnitCost.Value
                        : ((oldQty * oldAvg) + (m.Qty * m.UnitCost.Value)) / newQty;

                    item.OnHandQty = newQty;
                    item.AvgCost = newAvg;
                    item.CostUpdatedAt = DateTime.UtcNow;

                    m.AvgCostAfter = newAvg;
                    break;
                }

            case StockMovementType.Sale:
            case StockMovementType.Waste:
            case StockMovementType.ReturnToVendor:
                {
                    if (m.Qty >= 0) throw new InvalidOperationException("This movement must be negative qty.");
                    item.OnHandQty += m.Qty;
                    m.AvgCostAfter = item.AvgCost;
                    break;
                }

            case StockMovementType.InventoryAdjustment:
                {
                    if (m.Qty > 0)
                    {
                        var unitCost = m.UnitCost ?? item.AvgCost;
                        var oldQty = item.OnHandQty;
                        var oldAvg = item.AvgCost;

                        var newQty = oldQty + m.Qty;
                        var newAvg = (oldQty == 0)
                            ? unitCost
                            : ((oldQty * oldAvg) + (m.Qty * unitCost)) / newQty;

                        item.OnHandQty = newQty;
                        item.AvgCost = newAvg;
                        item.CostUpdatedAt = DateTime.UtcNow;

                        m.UnitCost = unitCost;
                        m.AvgCostAfter = newAvg;
                    }
                    else
                    {
                        if (item.OnHandQty + m.Qty < 0)
                            throw new InvalidOperationException("Adjustment would make stock negative.");

                        item.OnHandQty += m.Qty;
                        m.AvgCostAfter = item.AvgCost;
                    }
                    break;
                }

            default:
                throw new NotSupportedException($"Unsupported movement type: {m.Type}");
        }

        _db.StockMovements.Add(m);
        await _db.SaveChangesAsync(ct);

        if (!hasOuterTx)
            await tx!.CommitAsync(ct);

        return m;
    }
}
