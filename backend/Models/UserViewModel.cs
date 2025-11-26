using backend.Models;

namespace backend.ViewModels
{
    public class UserViewModel : User
    {
        public string? RoleName { get; set; }
        public string? EmployeeName { get; set; }
        public string? EmployeePosition { get; set; }
        public string? EmployeeDepartment { get; set; }
    }
}
