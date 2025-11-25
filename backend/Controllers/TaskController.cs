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
        public async System.Threading.Tasks.Task<IActionResult> GetAll()
        {
            var products = await _service.GetAllTastAsync();
            return Ok(products);
        }

        // ------------------------------------------------------
        // POST /api/tasks
        // ------------------------------------------------------
        [HttpPost]
        public async System.Threading.Tasks.Task<IActionResult> CreateTask([FromBody] backend.Models.Task task)
        {
            if (task == null)
                return BadRequest(new { message = "Task không được để trống." });

            if (string.IsNullOrEmpty(task.assignedToId))
                return BadRequest(new { message = "assignedToId là bắt buộc." });

            if (string.IsNullOrEmpty(task.id))
                task.id = "TASK" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            if (task.createddate == default(DateTime))
                task.createddate = DateTime.UtcNow;

            var createdTask = await _service.CreateTaskAsync(task, task.assignedToId);

            if (createdTask == null)
                return BadRequest(new { message = "Tạo task thất bại. Kiểm tra assignedToId hoặc dữ liệu task." });

            return Ok(createdTask);
        }

        // ------------------------------------------------------
        // PUT /api/tasks/{id}
        // ------------------------------------------------------
        [HttpPut("{id}")]
        public async System.Threading.Tasks.Task<IActionResult> UpdateTask(string id, [FromBody] backend.Models.Task task)
        {
            if (task == null) return BadRequest("Dữ liệu task trống!");
            
            task.id = id;
            var updated = await _service.UpdateTaskAsync(id, task);
            if (updated == null) return NotFound($"Không tìm thấy task {id}");
            return Ok(updated);
        }

        // ------------------------------------------------------
        // DELETE /api/tasks/{id}
        // ------------------------------------------------------
        [HttpDelete("{id}")]
        public async System.Threading.Tasks.Task<IActionResult> DeleteTask(string id)
        {
            bool deleted = await _service.DeleteTaskAsync(id);
            return Ok(new { message = "Xóa task thành công" });
        }

        // ------------------------------------------------------
        // GET /api/tasks/kanban
        // ------------------------------------------------------
        [HttpGet("kanban")]
        public async System.Threading.Tasks.Task<IActionResult> GetKanban()
        {
            var result = await _service.GetKanbanAsync();
            return Ok(result);
        }

        // ------------------------------------------------------
        // PATCH /api/tasks/reassign/{id}
        // ------------------------------------------------------
        [HttpPatch("reassign/{id}")]
        public async System.Threading.Tasks.Task<IActionResult> ReassignTask(string id, [FromQuery] string newEmployeeId)
        {
            var result = await _service.ReassignTaskAsync(id, newEmployeeId);
            return result ? Ok() : NotFound();
        }

        // ------------------------------------------------------
        // PATCH /api/tasks/status/{id} 
        // ------------------------------------------------------
        [HttpPatch("status/{id}")]
        public async System.Threading.Tasks.Task<IActionResult> UpdateStatus(string id, [FromQuery] string newStatus)
        {
            var result = await _service.UpdateTaskStatusAsync(id, newStatus);
            return result == null ? NotFound() : Ok(result);
        }

        // ------------------------------------------------------
        // GET /api/tasks/employee/{id}
        // ------------------------------------------------------
        [HttpGet("employee/{id}")]
        public async System.Threading.Tasks.Task<IActionResult> GetTasksByEmployee(string id)
        {
            var tasks = await _service.GetTasksByEmployeeAsync(id);
            return Ok(tasks);
        }
    }
}
