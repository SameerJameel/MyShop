namespace MyShop.Api.Dtos;

public class ItemBalanceDto
{
    public int ItemId { get; set; }
    public string ItemName { get; set; } = "";
    public string? Unit { get; set; }
    public string? CategoryName { get; set; }

    public decimal OnHandQty { get; set; }
    public decimal AvgCost { get; set; }
    public decimal StockValue { get; set; }

    public decimal? SalePrice { get; set; }        // إذا موجود عندك
    public decimal? LastPurchaseCost { get; set; } // من StockMovements
    public DateTime? LastMovementAt { get; set; }  // من StockMovements
}

public class BalanceSummaryDto
{
    public decimal TotalStockValue { get; set; }
    public decimal TotalOnHandQty { get; set; }
    public int ItemsCount { get; set; }
    public int LowStockCount { get; set; } // إذا عندك ReorderLevel لاحقاً
}
