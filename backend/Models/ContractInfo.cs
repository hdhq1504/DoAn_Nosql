namespace backend.Models
{
    public class Contract
    {
        public string id { get; set; } = "";
        public string customerId { get; set; } = "";
        public string productId { get; set; } = "";
        public DateTime purchaseDate { get; set; }
        public DateTime expiryDate { get; set; }
        public string status { get; set; } = "";
        public decimal contractValue { get; set; }
        public decimal commission { get; set; }
        public decimal commissionRate { get; set; }
    }
}
