namespace backend.Models
{
    public class Campaign
    {
        public string id { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty; // Tết, Hè, Doanh nghiệp
         public string type { get; set; } = "";
        public DateTime startDate { get; set; }
        public DateTime endDate { get; set; }
        public double budget { get; set; }
        public string status { get; set; } = "Active"; // Active, Inactive
    }

    public class CampaignRequest
    {
        public string name { get; set; } = "";
        public string type { get; set; } = "";
        public DateOnly startDate { get; set; }
        public DateOnly endDate { get; set; }
        public double budget { get; set; }
        public string status { get; set; } = "Planning";
    }

    public class TargetCustomer
    {
        public string id { get; set; } = string.Empty;
        public string name { get; set; } = string.Empty;
        public string segment { get; set; } = string.Empty; // VIP, Doanh nghiệp, Thường
        public string email { get; set; } = string.Empty;
        public string phone { get; set; } = string.Empty;
    }
}
