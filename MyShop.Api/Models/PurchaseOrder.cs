using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;


namespace MyShop.Api.Models;
public enum PurchaseOrderStatus
{
    Draft = 0,
    Sent = 1,
    Received = 2
}
public class PurchaseOrder
{
    public int Id { get; set; }

    public int? VendorId { get; set; }
    public Vendor? Vendor { get; set; }

    [Required]
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;

    public PurchaseOrderStatus? Status { get; set; } = PurchaseOrderStatus.Draft; // Draft, Sent, Received...

    public string? Notes { get; set; }

    public ICollection<PurchaseOrderLine> Lines { get; set; } = new List<PurchaseOrderLine>();
  
}
