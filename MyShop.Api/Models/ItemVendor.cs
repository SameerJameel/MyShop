namespace MyShop.Api.Models
{
    public class ItemVendor
    {
        public int ItemId { get; set; }
        public Item Item { get; set; } = null!;

        public int VendorId { get; set; }
        public Vendor Vendor { get; set; } = null!;

        public string? VendorSKU { get; set; }
        public decimal? LastPurchasePrice { get; set; }
    }
}
