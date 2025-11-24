
    namespace backend.Models
    {
        public class Task
        {
            public string id { get; set; } = null!;
            public string title { get; set; } = null!;
            public string description { get; set; } = null!;
            public string priority { get; set; } = null!;
            public string status { get; set; } = null!;
            public string type { get; set; } = null!;
            public DateTime dueDate { get; set; }
            public DateTime createddate { get; set; }
            public Employee? assignedTo { get; set; }
            public Customer? relatedCustomer { get; set; }
        }

    }