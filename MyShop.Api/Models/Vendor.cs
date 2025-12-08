namespace MyShop.Api.Models
{
    public class Vendor
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string? WhatsApp { get; set; }
        public string? Terms { get; set; }

        public string? Notes { get; set; }
        public ICollection<ItemVendor> ItemVendors { get; set; } = new List<ItemVendor>();
    }
}
