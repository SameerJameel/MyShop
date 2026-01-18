namespace MyShop.Api.DTOs;

/// <summary>
/// ViewModel لشاشة الاستلام - جلب البيانات
/// </summary>
public class PurchaseOrderReceiveVm
{
    public int Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public decimal? DiscountAmount { get; set; }
    public decimal? PaidAmount { get; set; }
    public string? Notes { get; set; }
    public List<PurchaseOrderReceiveLineVm> Lines { get; set; } = new();
}

public class PurchaseOrderReceiveLineVm
{
    public int LineId { get; set; }
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal OrderedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal? PurchasePrice { get; set; }
    public decimal? SalePrice { get; set; }
}

/// <summary>
/// Request لاستلام الطلبية - تحديث البيانات
/// </summary>
public class PurchaseOrderReceiveRequest
{
    public int PoId { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public List<PurchaseOrderReceiveRequestLine> Lines { get; set; } = new();
}

public class PurchaseOrderReceiveRequestLine
{
    public int LineId { get; set; }
    public int ItemId { get; set; }
    public string ItemName { get; set; } = string.Empty;
    public decimal OrderedQuantity { get; set; }
    public decimal ReceivedQuantity { get; set; }
    public decimal PurchasePrice { get; set; }
    public decimal SalePrice { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Request لحفظ دفعة على طلبية شراء
/// </summary>
public class PurchaseOrderPaymentRequest
{
    public int PaymentId { get; set; }
    public int VendorId { get; set; }
    public DateTime OrderDate { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal PaidAmount { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Response لبيانات الدفع
/// </summary>
public class PurchaseOrderPaymentVm
{
    public int Id { get; set; }
    public int VendorId { get; set; }
    public string VendorName { get; set; } = string.Empty;
    public DateTime OrderDate { get; set; }
    public decimal? TotalAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public decimal? PaidAmount { get; set; }
    public decimal? RemainingAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
}