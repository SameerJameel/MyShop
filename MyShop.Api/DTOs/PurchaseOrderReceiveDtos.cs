namespace MyShop.Api.DTOs
{
    public class PurchaseOrderReceiveLineVm
    {
        public int LineId { get; set; }
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? Unit { get; set; }

        public decimal OrderedQuantity { get; set; }
        public decimal ReceivedQuantity { get; set; }

        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }
    }

    // نموذج العرض للرأس + الأسطر (GET)
    public class PurchaseOrderReceiveVm
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; } = string.Empty; // لو عندك رقم طلبية
        public DateTime OrderDate { get; set; }
        public string VendorName { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        public decimal DiscountAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public string? Notes { get; set; }

        public List<PurchaseOrderReceiveLineVm> Lines { get; set; } = new();
    }

    // نموذج الاستلام اللي جاي من Angular (POST)
    public class PurchaseOrderReceiveRequest
    {
        public DateTime ReceiveDate { get; set; }
        public decimal DiscountAmount { get; set; }
        public decimal PaidAmount { get; set; }
        public string? Notes { get; set; }

        public List<PurchaseOrderReceiveRequestLine> Lines { get; set; } = new();
    }

    public class PurchaseOrderReceiveRequestLine
    {
        public int LineId { get; set; }
        public decimal ReceivedQuantity { get; set; }
        public decimal PurchasePrice { get; set; }
        public decimal SalePrice { get; set; }
    }
}