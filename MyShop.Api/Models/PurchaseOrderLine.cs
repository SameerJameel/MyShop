using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace MyShop.Api.Models;

public class PurchaseOrderLine
{
    public int Id { get; set; }

    // المفتاح الأجنبي
    public int ItemId { get; set; }

    [ValidateNever]
    public Item Item { get; set; } = null!;

    public int PurchaseOrderId { get; set; }

    [ValidateNever]
    [JsonIgnore]
    public PurchaseOrder PurchaseOrder { get; set; } = null!;

    public decimal Quantity { get; set; }

    public string? Notes { get; set; }
}
