using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Mvc;


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly TaskService _service;

        public TasksController(TaskService service)
        {
            _service = service;
        }

        // ------------------------------------------------------
        // GET /api/tasks
        // ------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var products = await _service.GetAllTastAsync();
            return Ok(products);
        }

        // ------------------------------------------------------
        // POST /api/tasks
        // ------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> CreateTask(string employeeId, [FromBody] backend.Models.Task task)
        {
            // If employeeId is not provided in query string, try to find a default or return error
            // For simplicity, we'll require it as a query parameter or default to a known admin ID if needed
            // But better to keep it required.
            if (string.IsNullOrEmpty(employeeId))
                 // Fallback: if not in query, check if it's in the body (though model binding might not map it there easily without DTO)
                 // For now, let's assume the frontend sends it as a query param ?employeeId=...
                 return BadRequest(new { message = "employeeId là bắt buộc (query param)." });

            if (task == null)
                return BadRequest(new { message = "Task không được để trống." });

            if (string.IsNullOrEmpty(task.id))
                task.id = "TASK" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            var createdTask = await _service.CreateTaskAsync(task, employeeId);

            if (createdTask == null)
                return BadRequest(new { message = "Tạo task thất bại. Kiểm tra employeeId hoặc dữ liệu task." });

            return Ok(createdTask);
        }

        // ------------------------------------------------------
        // PUT /api/tasks/{id}
        // ------------------------------------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTask(string id, [FromBody] backend.Models.Task task)
        {
            if (task == null) return BadRequest("Dữ liệu task trống!");
            var updated = await _service.UpdateTaskAsync(id, task);
            if (updated == null) return NotFound($"Không tìm thấy task {id}");
            return Ok(updated);
        }

        // ------------------------------------------------------
        // DELETE /api/tasks/{id}
        // ------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTask(string id)
        {
            bool deleted = await _service.DeleteTaskAsync(id);
            return Ok(new { message = "Xóa task thành công" });
        }

        // ------------------------------------------------------
        // GET /api/tasks/kanban
        // ------------------------------------------------------
        [HttpGet("kanban")]
        public async Task<IActionResult> GetKanban()
        {
            var result = await _service.GetKanbanAsync();
            return Ok(result);
        }

        // ------------------------------------------------------
        // PATCH /api/tasks/reassign/{id}
        // ------------------------------------------------------
        [HttpPatch("reassign/{id}")]
        public async Task<IActionResult> ReassignTask(string id, [FromQuery] string newEmployeeId)
        {
            var result = await _service.ReassignTaskAsync(id, newEmployeeId);
            return result ? Ok() : NotFound();
        }

        // ------------------------------------------------------
        // PATCH /api/tasks/status/{id} 
        // ------------------------------------------------------
        [HttpPatch("status/{id}")]
        public async Task<IActionResult> UpdateStatus(string id, [FromQuery] string newStatus)
        {
            var result = await _service.UpdateTaskStatusAsync(id, newStatus);
            return result == null ? NotFound() : Ok(result);
        }

        // ------------------------------------------------------
        // GET /api/tasks/employee/{id}
        // ------------------------------------------------------
        [HttpGet("employee/{id}")]
        public async Task<IActionResult> GetTasksByEmployee(string id)
        {
            var tasks = await _service.GetTasksByEmployeeAsync(id);
            return Ok(tasks);
        }
    }
}
