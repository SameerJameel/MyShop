namespace MyShop.Api.Models
{
    public class Employee
    {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public decimal BaseSalary { get; set; }     // راتب شهري
        public decimal OvertimeHourlyRate { get; set; }  // أجر الساعة الإضافية

        public bool IsActive { get; set; } = true;

        public string? Notes { get; set; }

        public ICollection<EmployeeTransaction> Transactions { get; set; }
            = new List<EmployeeTransaction>();
    }
}
