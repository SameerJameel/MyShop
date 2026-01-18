using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace MyShop.Api.Models
{
    public class Item
    {

        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        // kg / piece / carton / pack
        public string Unit { get; set; } = "kg";

        public int CategoryId { get; set; }

        
        [ValidateNever]
        public Category? Category { get; set; } 

        public decimal? DefaultPurchasePrice { get; set; }
        public decimal DefaultSalePrice { get; set; }
        public decimal ReorderLevel { get; set; }

        // خدمة فرم مثلاً
        public bool IsService { get; set; } = false;
        // منتجات جاهزة (كفتة/مفروم)
        public bool IsProduced { get; set; } = false;
        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
        [Column(TypeName = "decimal(18,3)")]
        public decimal OnHandQty { get; set; } = 0;

        [Column(TypeName = "decimal(18,4)")]
        public decimal AvgCost { get; set; } = 0;

        public DateTime? CostUpdatedAt { get; set; }
        public ICollection<ItemVendor> ItemVendors { get; set; } = new List<ItemVendor>();
    }
}
