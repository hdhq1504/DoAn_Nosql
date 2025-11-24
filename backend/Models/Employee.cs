
using backend.Models;
namespace backend.Models
{
    public class Employee
    {
        public string id { get; set; } = null!;
        public string name { get; set; } = null!;
        public string position { get; set; } = null!;
        public string department { get; set; } = null!;
        public string email { get; set; } = null!;
        public string phone { get; set; } = null!;
        public string status { get; set; } = null!;
        public DateTime hiredate { get; set; }
        public double performanceScore { get; set; }
    }

    public class KPI
    {
        public string id { get; set; } = default!;
        public string employeeId { get; set; } = default!;
        public string employeeName { get; set; } = default!;
        public int totalTasks { get; set; }
        public int completedTasks { get; set; }
        public int pendingTasks { get; set; }
        public int inProgressTasks { get; set; }
        public double performanceScore { get; set; }
        public string month { get; set; } = "";
        public double successRate { get; set; }
        public decimal totalSales { get; set; }
    }
}