using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyShop.Api.Models;

public enum StockMovementType
{
    PurchaseReceipt = 10,      // استلام شراء (يزيد)
    Sale = 20,                 // بيع (ينقص)
    InventoryAdjustment = 30,  // تسوية جرد (+/-)
    Waste = 40,                // تلف/هدر (ينقص)
    ReturnToVendor = 50        // مرتجع للمورد (ينقص)
}

public class StockMovement
{
    public long Id { get; set; }

    [Required]
    public int ItemId { get; set; }
    public Item? Item { get; set; }

    [Required]
    public DateTime Date { get; set; } = DateTime.UtcNow;

    [Required]
    public StockMovementType Type { get; set; }

    /// <summary>
    /// Change in quantity (+ increases stock, - decreases stock)
    /// </summary>
    [Column(TypeName = "decimal(18,3)")]
    public decimal Qty { get; set; }

    /// <summary>
    /// Unit cost (only meaningful for receipt/adjustment if you decide).
    /// For sales, you typically leave it null and use AvgCost at time of movement.
    /// </summary>
    [Column(TypeName = "decimal(18,4)")]
    public decimal? UnitCost { get; set; }

    /// <summary>
    /// For auditing: what avg cost was used at posting time (optional but very useful).
    /// </summary>
    [Column(TypeName = "decimal(18,4)")]
    public decimal? AvgCostAfter { get; set; }

    // Optional references (so later you can link to PO line / Inventory line / Sale line)
    public int? PurchaseOrderId { get; set; }
    public int? PurchaseOrderLineId { get; set; }
    public int? InventoryId { get; set; }

    [MaxLength(400)]
    public string? Notes { get; set; }
}
