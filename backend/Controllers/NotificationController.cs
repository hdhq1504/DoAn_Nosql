using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly NotificationService _notificationService;

        public NotificationController(NotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet]
        public async Task<IActionResult> GetNotifications([FromQuery] string filter = "all", [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var result = await _notificationService.GetNotificationsAsync(filter, Math.Max(page, 1), Math.Clamp(pageSize, 1, 50));
            return Ok(result);
        }

        [HttpPost("{id}/read")]
        public async Task<IActionResult> MarkAsRead(string id)
        {
            var updated = await _notificationService.MarkAsReadAsync(id);
            return updated ? Ok() : NotFound();
        }

        [HttpPost("{id}/unread")]
        public async Task<IActionResult> MarkAsUnread(string id)
        {
            var updated = await _notificationService.MarkAsUnreadAsync(id);
            return updated ? Ok() : NotFound();
        }

        [HttpPost("mark-all-read")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            await _notificationService.MarkAllAsReadAsync();
            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var deleted = await _notificationService.DeleteAsync(id);
            return deleted ? NoContent() : NotFound();
        }

        [HttpGet("stream")]
        public async Task Stream(CancellationToken cancellationToken)
        {
            Response.Headers.Add("Content-Type", "text/event-stream");
            var (id, reader) = _notificationService.Subscribe();

            try
            {
                await foreach (var summary in reader.ReadAllAsync(cancellationToken))
                {
                    var payload = JsonSerializer.Serialize(summary);
                    await Response.WriteAsync($"data: {payload}\\n\\n", cancellationToken);
                    await Response.Body.FlushAsync(cancellationToken);
                }
            }
            finally
            {
                _notificationService.Unsubscribe(id);
            }
        }
    }
}
backend/Models/Notification.cs
New
+40
-0

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