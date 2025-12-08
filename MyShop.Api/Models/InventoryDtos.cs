using System;
using System.Collections.Generic;

namespace MyShop.Api.Models
{
    public class InventoryCreateDto
    {
        public DateTime Date { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }

        // الأصناف اللي جردناها
        public List<InventoryItemDto> Items { get; set; } = new();
    }

    public class InventoryItemDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public int? CategoryId { get; set; }
        public string? CategoryName { get; set; }

        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
    }

    public class InventoryListDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int ItemsCount { get; set; }
        public string? CreatedBy { get; set; }
    }

    public class InventoryDetailsDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public decimal TotalAmount { get; set; }
        public string? CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; }

        public List<InventoryLineDto> Lines { get; set; } = new();
    }

    public class InventoryLineDto
    {
        public int ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string? Unit { get; set; }
        public string? CategoryName { get; set; }
        public decimal Quantity { get; set; }
        public decimal SalePrice { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
