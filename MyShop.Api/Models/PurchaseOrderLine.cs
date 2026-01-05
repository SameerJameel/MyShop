using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace MyShop.Api.Models;

public class PurchaseOrderLine
{
    public int Id { get; set; }

    public int PurchaseOrderId { get; set; }
    [ValidateNever]
    [JsonIgnore]
    public PurchaseOrder PurchaseOrder { get; set; } = null!;

    public int ItemId { get; set; }
    [ValidateNever]
    public Item Item { get; set; } = null!;

    // الكمية المطلوبة بالطلب
    public decimal OrderedQuantity { get; set; }

    // الكمية المستلمة فعليًا
    public decimal ReceivedQuantity { get; set; }

    // سعر الشراء النهائي للوحدة
    public decimal PurchasePrice { get; set; }

    // سعر البيع الافتراضي لهذا الصنف (وقت الاستلام)
    public decimal SalePrice { get; set; }
    public string? Notes { get; set; }
}

