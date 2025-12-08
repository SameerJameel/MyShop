using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using System.Text.Json.Serialization;

namespace MyShop.Api.Models
{
    public class EmployeeTransaction
    {
        public int Id { get; set; }

        public int EmployeeId { get; set; }

        [JsonIgnore]
        [ValidateNever]
        public Employee Employee { get; set; } = null!;

        public DateTime Date { get; set; }

        public EmployeeTransactionType Type { get; set; }

        public decimal Amount { get; set; }

        // للساعات الإضافية فقط (اختياري)
        public decimal? Hours { get; set; }

        public string? Notes { get; set; }
    }

    public enum EmployeeTransactionType
    {
        Salary = 0,
        Withdrawal = 1,
        Overtime = 2
    }
}
