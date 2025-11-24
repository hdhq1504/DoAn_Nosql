using backend.Models;
using System.Collections.Concurrent;
using System.Threading.Channels;

namespace backend.Service
{
    public class NotificationService
    {
        private readonly List<Notification> _notifications;
        private readonly object _lock = new();
        private readonly ConcurrentDictionary<Guid, Channel<NotificationSummary>> _subscribers = new();

        public NotificationService()
        {
            _notifications = SeedNotifications();
        }

        public Task<NotificationListResponse> GetNotificationsAsync(string filter, int page, int pageSize)
        {
            IEnumerable<Notification> query;
            lock (_lock)
            {
                query = _notifications
                    .OrderByDescending(n => n.CreatedAt)
                    .Where(n => filter switch
                    {
                        "unread" => !n.IsRead,
                        "read" => n.IsRead,
                        _ => true
                    })
                    .ToList();
            }

            var total = query.Count();
            if (total == 0)
            {
                return Task.FromResult(new NotificationListResponse
                {
                    Items = Enumerable.Empty<Notification>(),
                    Total = 0,
                    Summary = new NotificationSummary { Total = 0, Unread = 0 }
                });
            }

            var items = query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            var summary = GetSummary();

            return Task.FromResult(new NotificationListResponse
            {
                Items = items,
                Total = total,
                Summary = summary
            });
        }

        public async Task<bool> MarkAsReadAsync(string id)
        {
            var updated = UpdateNotification(id, n => n.IsRead = true);
            if (updated)
            {
                await BroadcastSummaryAsync();
            }
            return updated;
        }

        public async Task<bool> MarkAsUnreadAsync(string id)
        {
            var updated = UpdateNotification(id, n => n.IsRead = false);
            if (updated)
            {
                await BroadcastSummaryAsync();
            }
            return updated;
        }

        public async Task<bool> MarkAllAsReadAsync()
        {
            lock (_lock)
            {
                foreach (var notification in _notifications)
                {
                    notification.IsRead = true;
                }
            }
            await BroadcastSummaryAsync();
            return true;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var removed = false;
            lock (_lock)
            {
                var toRemove = _notifications.FirstOrDefault(n => n.Id == id);
                if (toRemove != null)
                {
                    _notifications.Remove(toRemove);
                    removed = true;
                }
            }

            if (removed)
            {
                await BroadcastSummaryAsync();
            }

            return removed;
        }

        public (Guid id, ChannelReader<NotificationSummary> reader) Subscribe()
        {
            var channel = Channel.CreateUnbounded<NotificationSummary>();
            var id = Guid.NewGuid();
            _subscribers[id] = channel;

            channel.Writer.TryWrite(GetSummary());
            return (id, channel.Reader);
        }

        public void Unsubscribe(Guid id)
        {
            if (_subscribers.TryRemove(id, out var channel))
            {
                channel.Writer.TryComplete();
            }
        }

        private NotificationSummary GetSummary()
        {
            lock (_lock)
            {
                var total = _notifications.Count;
                var unread = _notifications.Count(n => !n.IsRead);
                return new NotificationSummary
                {
                    Total = total,
                    Unread = unread
                };
            }
        }

        private bool UpdateNotification(string id, Action<Notification> updateAction)
        {
            lock (_lock)
            {
                var notification = _notifications.FirstOrDefault(n => n.Id == id);
                if (notification == null)
                {
                    return false;
                }

                updateAction(notification);
                return true;
            }
        }

        private Task BroadcastSummaryAsync()
        {
            var summary = GetSummary();
            foreach (var subscriber in _subscribers.Values)
            {
                subscriber.Writer.TryWrite(summary);
            }

            return Task.CompletedTask;
        }

        private List<Notification> SeedNotifications()
        {
            var now = DateTime.UtcNow;
            return new List<Notification>
            {
                new()
                {
                    Id = "1",
                    Type = "customer",
                    Title = "Khách hàng mới",
                    Description = "Nguyễn Văn An vừa đăng ký tài khoản",
                    CreatedAt = now.AddMinutes(-5),
                    IsRead = false
                },
                new()
                {
                    Id = "2",
                    Type = "contract",
                    Title = "Hợp đồng mới",
                    Description = "Hợp đồng #1234 cần được duyệt",
                    CreatedAt = now.AddMinutes(-10),
                    IsRead = false
                },
                new()
                {
                    Id = "3",
                    Type = "task",
                    Title = "Công việc sắp hết hạn",
                    Description = "3 công việc sẽ hết hạn trong 24 giờ tới",
                    CreatedAt = now.AddHours(-1),
                    IsRead = false
                },
                new()
                {
                    Id = "4",
                    Type = "payment",
                    Title = "Thanh toán thành công",
                    Description = "Khách hàng Trần Thị Bình đã thanh toán ₫45M",
                    CreatedAt = now.AddHours(-2),
                    IsRead = true
                },
                new()
                {
                    Id = "5",
                    Type = "customer",
                    Title = "Khách hàng mới",
                    Description = "Công ty TNHH ABC đã đăng ký gói doanh nghiệp",
                    CreatedAt = now.AddHours(-3),
                    IsRead = true
                },
                new()
                {
                    Id = "6",
                    Type = "contract",
                    Title = "Hợp đồng đã ký",
                    Description = "Hợp đồng #1230 đã được ký thành công",
                    CreatedAt = now.AddHours(-24),
                    IsRead = true
                },
                new()
                {
                    Id = "7",
                    Type = "task",
                    Title = "Công việc hoàn thành",
                    Description = "Lê Minh Cường đã hoàn thành công việc 'Gọi điện tư vấn'",
                    CreatedAt = now.AddDays(-2),
                    IsRead = true
                },
                new()
                {
                    Id = "8",
                    Type = "payment",
                    Title = "Thanh toán thất bại",
                    Description = "Giao dịch #5678 bị từ chối. Vui lòng kiểm tra lại",
                    CreatedAt = now.AddDays(-3),
                    IsRead = true
                }
            };
        }
    }
}