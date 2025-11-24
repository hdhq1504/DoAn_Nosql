namespace backend.Models
{
    public class Product
    {
        public string id { get; set; } = null!;
        public string name { get; set; } = null!;
        public string category { get; set; } = null!;
        public double price { get; set; }
        public int duration { get; set; } // tháng
        public string description { get; set; } = null!;
        public string status { get; set; } = null!;
        public double commissionRate { get; set; }
    }
}