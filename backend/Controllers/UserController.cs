using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserService _userService;

        public UserController(UserService userService)
        {
            _userService = userService;
        }

        [HttpGet("{email}")]
        public async Task<IActionResult> GetUser(string email)
        {
            var user = await _userService.GetUserByEmailAsync(email);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPut("{email}")]
        public async Task<IActionResult> UpdateUser(string email, [FromBody] User user)
        {
            var updatedUser = await _userService.UpdateUserAsync(email, user);
            if (updatedUser == null) return NotFound();
            return Ok(updatedUser);
        }
        [HttpGet]
        public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 10, [FromQuery] string search = "", [FromQuery] string role = "")
        {
            try
            {
                var (users, total) = await _userService.GetUsersAsync(page, pageSize, search, role);
                return Ok(new
                {
                    Data = users,
                    Total = total,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling(total / (double)pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            var result = await _userService.DeleteUserAsync(id);
            if (!result) return NotFound();
            return Ok(new { Message = "User deleted successfully" });
        }
    }
}
