namespace backend.Models
{
    public class DashboardMetrics
    {
        public int TotalCustomers { get; set; }
        public int ActiveCustomers { get; set; }
        public int TotalEmployees { get; set; }
        public double TotalRevenue { get; set; }
        public int TotalInteractions { get; set; }
        public int PendingTasks { get; set; }
        public double AveragePerformanceScore { get; set; }
        public int TotalTasks { get; set; } 
    }

    public class SalesStage
    {
        public string Stage { get; set; } = string.Empty;       // Ví dụ: "Prospect", "Negotiation", "Closed"
        public int DealCount { get; set; }                      // Số lượng hợp đồng trong giai đoạn
        public double TotalValue { get; set; }                  // Tổng giá trị hợp đồng
        public double AverageDealValue { get; set; }            // Giá trị trung bình
        public double ConversionRate { get; set; }              // Tỷ lệ chuyển đổi (nếu có)
    }

    public class CustomerSegmentReport
    {
        public string Segment { get; set; } = string.Empty;     // VIP / Doanh nghiệp / Thường
        public int CustomerCount { get; set; }                  // Số lượng khách hàng trong nhóm
        public double AverageLTV { get; set; }                  // Lifetime Value trung bình
        public double AverageSatisfaction { get; set; }         // Điểm hài lòng trung bình
        public double AverageInteractions { get; set; }         // Số tương tác trung bình
    }

    public class EmployeePerformance
    {
        public string EmployeeId { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = string.Empty;
        public int TotalCustomers { get; set; }                 // Số khách hàng phụ trách
        public int ProductsSold { get; set; }                   // Số sản phẩm đã bán
        public double TotalCommission { get; set; }             // Tổng hoa hồng
        public double TotalRevenue { get; set; }                // Tổng doanh thu từ khách hàng quản lý
        public double PerformanceScore { get; set; }            // Điểm hiệu suất
        public int CompletedTasks { get; set; }                 // Task hoàn thành
    }

    public class InteractionStats
    {
        public string InteractionType { get; set; } = string.Empty;  // call, email, meeting
        public int Count { get; set; }                               // Số lượng tương tác loại đó
        public string CustomerSegment { get; set; } = string.Empty;  // nhóm khách hàng (nếu có)
    }
    
    public class RevenueReport
    {
        public int Year { get; set; }
        public int Month { get; set; }
        public double TotalRevenue { get; set; }
        public double TotalCommission { get; set; }
        public int TotalContracts { get; set; }
    }
}
