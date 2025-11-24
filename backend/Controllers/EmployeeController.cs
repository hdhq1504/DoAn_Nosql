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

        public EmployeesController(EmployeeService service)
        {
            _service = service;
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
