namespace backend.Models
{
    public class User
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public string RoleId { get; set; }
    }
}
