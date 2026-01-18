using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MyShop.Api.Models;

public enum PurchaseOrderStatus
{
    Draft = 0,
    Sent = 1,
    Received = 2,
    Cancelled = 3,
    Payment = 4
}

public class PurchaseOrder
{
    public int Id { get; set; }

    public DateTime OrderDate { get; set; }

    public int? VendorId { get; set; }

    [ValidateNever]
    public Vendor? Vendor { get; set; }

    public PurchaseOrderStatus Status { get; set; } = PurchaseOrderStatus.Draft;

    // إجمالي قيمة الطلبية بعد الاستلام (اختياري)
    public decimal? TotalAmount { get; set; } = 0m;

    // تاريخ الاستلام الفعلي
    public DateTime? ReceiveDate { get; set; }

    // خصم (على مستوى الفاتورة)
    public decimal? DiscountAmount { get; set; } = 0m;

    // المبلغ المدفوع الآن (دفعة أو كامل المبلغ)
    public decimal? PaidAmount { get; set; } = 0m;

    public string? Notes { get; set; }

    [ValidateNever]
    public ICollection<PurchaseOrderLine> Lines { get; set; } = new List<PurchaseOrderLine>();
}

