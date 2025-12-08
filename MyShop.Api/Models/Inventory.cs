using System;
using System.Collections.Generic;

namespace MyShop.Api.Models
{
    public class Inventory
    {
        public int Id { get; set; }

        public DateTime Date { get; set; }

        public string Name { get; set; } = string.Empty;   // اسم الجرد (مثلاً جرد نهاية 2025/12/05)

        public string? Notes { get; set; }

        // إجمالي قيمة الجرد (مجموع الكميات * سعر البيع)
        public decimal TotalAmount { get; set; }

        public string? CreatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public ICollection<InventoryLine> Lines { get; set; } = new List<InventoryLine>();
    }

    public class InventoryLine
    {
        public int Id { get; set; }

        public int InventoryId { get; set; }
        public Inventory? Inventory { get; set; }

        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? Unit { get; set; }

        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }

        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }

        public decimal TotalPrice { get; set; } // Quantity * SalePrice وقت الجرد
    }
}
