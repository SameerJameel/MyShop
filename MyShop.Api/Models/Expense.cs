namespace MyShop.Api.Models
{
    public class Expense
    {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;
        public DateTime Date { get; set; }

        public string Category { get; set; } = string.Empty;

        public decimal Amount { get; set; }

        public string? PaymentMethod { get; set; }

        public string? Notes { get; set; }
    }
}
