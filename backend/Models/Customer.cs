using backend.Models;
namespace backend.Models
{
    public class Customer
    {
        public string id { get; set; } = null!;
        public string name { get; set; } = null!;
        public string phone { get; set; } = null!;
        public string email { get; set; } = null!;
        public string type { get; set; } = null!; // Cá nhân / Doanh nghiệp
        public string address { get; set; } = null!;
        public string status { get; set; } = null!;
        public string segment { get; set; } = null!; // VIP / Doanh nghiệp / Thường
        public string? company { get; set; }
        public DateTime createddate { get; set; }
        public double lifetimevalue { get; set; }
        public DateTime lastcontact { get; set; }
        public double satisfactionScore { get; set; }
    }

      public class Interaction
    {
        public string id { get; set; } = null!;
        public string type { get; set; } = null!; // call, email, meeting
        public string description { get; set; } = null!;
        public string date { get; set; } = null!;
    }

    public class Journey
    {
        public string step { get; set; } = null!;
        public string detail { get; set; } = null!;
        public string date { get; set; } = null!;
    }
}
