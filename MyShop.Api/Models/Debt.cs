namespace MyShop.Api.Models
{
    public class Debt
    {
        public int Id { get; set; }

        public string PersonName { get; set; } = string.Empty;

        public bool IsVendor { get; set; }  // true تاجر - false زبون

        public string? Phone { get; set; }

        public DateTime Date { get; set; }

        public decimal Amount { get; set; }

        public DebtDirection Direction { get; set; }

        public string? Notes { get; set; }
    }

    public enum DebtDirection
    {
        WeOwe = 1,    // نحن مدينون
        OwedToUs = 2  // الآخرين مدينون لنا
    }
}
