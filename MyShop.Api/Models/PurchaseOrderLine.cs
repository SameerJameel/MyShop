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
    public decimal OrderedQuantity { get; set; } = 0m;

    // الكمية المستلمة فعليًا
    public decimal ReceivedQuantity { get; set; } = 0m;

    // سعر الشراء النهائي للوحدة
    public decimal? PurchasePrice { get; set; } = 0m;

    // سعر البيع الافتراضي لهذا الصنف (وقت الاستلام)
    public decimal? SalePrice { get; set; } = 0m;
    public string? Notes { get; set; }
}

