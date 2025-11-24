using System.Text.Json.Serialization;

namespace backend.Models
{
    public class Notification
    {
        [JsonPropertyName("id")]
        public string Id { get; set; } = Guid.NewGuid().ToString();
        [JsonPropertyName("type")]
        public string Type { get; set; } = string.Empty;
        [JsonPropertyName("title")]
        public string Title { get; set; } = string.Empty;
        [JsonPropertyName("description")]
        public string Description { get; set; } = string.Empty;
        [JsonPropertyName("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        [JsonPropertyName("isRead")]
        public bool IsRead { get; set; }
    }

    public class NotificationSummary
    {
        [JsonPropertyName("total")]
        public int Total { get; set; }
        [JsonPropertyName("unread")]
        public int Unread { get; set; }
        [JsonPropertyName("read")]
        public int Read => Total - Unread;
    }

    public class NotificationListResponse
    {
        [JsonPropertyName("items")]
        public IEnumerable<Notification> Items { get; set; } = Enumerable.Empty<Notification>();
        [JsonPropertyName("total")]
        public int Total { get; set; }
        [JsonPropertyName("summary")]
        public NotificationSummary Summary { get; set; } = new NotificationSummary();
    }
}