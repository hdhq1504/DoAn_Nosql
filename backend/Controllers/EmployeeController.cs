using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmployeesController : ControllerBase
    {
        private readonly EmployeeService _service;
        private readonly UserService _userService;

        public EmployeesController(EmployeeService service, UserService userService)
        {
            _service = service;
            _userService = userService;
        }

        [HttpGet]
        [ProducesResponseType(typeof(IEnumerable<Employee>), 200)]
        public async Task<IActionResult> GetAll()
        {
            var employees = await _service.GetAllEmployeesAsync();
            return Ok(employees);
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(Employee), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetById(string id)
        {
            var employee = await _service.GetEmployeeByIdAsync(id);
            if (employee == null) return NotFound($"Không tìm thấy nhân viên {id}");
            return Ok(employee);
        }

        [HttpPost]
        [ProducesResponseType(typeof(Employee), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> Create([FromBody] Employee employee)
        {
            if (employee == null) return BadRequest("Dữ liệu nhân viên trống");
            
            if (string.IsNullOrEmpty(employee.id))
                employee.id = "EMP" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            var created = await _service.CreateEmployeeAsync(employee);
            if (created == null) return BadRequest("Không thể tạo nhân viên");

            // Tự động tạo tài khoản User
            try 
            {
                var newUser = new User
                {
                    Id = "U" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper(),
                    Username = employee.name, // Hoặc dùng email làm username
                    Email = employee.email,
                    Password = "123456", // Mật khẩu mặc định
                    RoleId = "ROLE03", // Mặc định là Employee
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow,
                    Avatar = "",
                    Phone = employee.phone,
                    Address = "",
                    Bio = $"Nhân viên: {employee.position} - {employee.department}"
                };

                await _userService.CreateUserAsync(newUser);
            }
            catch (Exception ex)
            {
                // Log lỗi nhưng không chặn việc tạo nhân viên thành công
                Console.WriteLine($"Lỗi khi tạo user cho nhân viên: {ex.Message}");
            }

            return Ok(created);
        }

        [HttpPut("{id}")]
        [ProducesResponseType(typeof(Employee), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> Update(string id, [FromBody] Employee employee)
        {
            if (employee == null) return BadRequest("Dữ liệu nhân viên trống");
            var updated = await _service.UpdateEmployeeAsync(id, employee);
            if (updated == null) return NotFound($"Không tìm thấy nhân viên {id}");
            return Ok(updated);
        }

        [HttpDelete("{id}")]
        [ProducesResponseType(200)]
        public async Task<IActionResult> Delete(string id)
        {
            await _service.DeleteEmployeeAsync(id);
            return Ok(new { message = "Xóa nhân viên thành công" });
        }
    }
}
