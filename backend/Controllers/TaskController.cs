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
        // GET /api/tasks/GetAll
        // ------------------------------------------------------
        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll()
        {
            var products = await _service.GetAllTastAsync();
            return Ok(products);
        }

        // ------------------------------------------------------
        // POST /api/tasks/create
        // ------------------------------------------------------
        [HttpPost("create")]
        public async Task<IActionResult> CreateTask(string employeeId, [FromBody] backend.Models.Task task)
        {
            if (string.IsNullOrEmpty(employeeId))
                return BadRequest(new { message = "employeeId là bắt buộc." });

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
        // GET /api/tasks/get/kanban
        // ------------------------------------------------------
        [HttpGet("get/kanban")]
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
        // GET /api/tasks/{id}/tasks
        // ------------------------------------------------------
        [HttpGet("task/{id}")]
        public async Task<IActionResult> GetTasks(string id)
        {
            var tasks = await _service.GetTasksByEmployeeAsync(id);
            return Ok(tasks);
        }
    }
}
