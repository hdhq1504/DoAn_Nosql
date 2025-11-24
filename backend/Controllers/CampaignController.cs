using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CampaignsController : ControllerBase
    {
        private readonly CampaignService _service;

        public CampaignsController(CampaignService service)
        {
            _service = service;
        }

        // ------------------------------------------------------
        // Tạo chiến dịch mới
        // ------------------------------------------------------
        [HttpPost]
        public async Task<IActionResult> CreateCampaign([FromBody] Campaign campaign)
        {
            if (campaign == null) return BadRequest("Dữ liệu chiến dịch trống!");
            var created = await _service.CreateCampaignAsync(campaign);
            if (created == null) return BadRequest("Không thể tạo chiến dịch.");
            return Ok(created);
        }

        // ------------------------------------------------------
        // Lấy danh sách chiến dịch
        // ------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetCampaigns()
        {
            var list = await _service.GetCampaignsAsync();
            return Ok(list);
        }

        // ------------------------------------------------------
        // Lấy chi tiết chiến dịch theo id
        // ------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCampaignById(string id)
        {
            var campaign = await _service.GetCampaignByidAsync(id);
            if (campaign == null) return NotFound($"Không tìm thấy chiến dịch {id}");
            return Ok(campaign);
        }

        // ------------------------------------------------------
        // Cập nhật chiến dịch
        // ------------------------------------------------------
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCampaign(string id, [FromBody] CampaignRequest req)
        {
            if (req == null) return BadRequest("Dữ liệu cập nhật trống!");
            var updated = await _service.UpdateCampaignAsync(id, req);
            if (updated == null) return NotFound($"Không tìm thấy chiến dịch {id}");
            return Ok(updated);
        }

        // ------------------------------------------------------
        // Xóa chiến dịch
        // ------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCampaign(string id)
        {
            bool deleted = await _service.DeleteCampaignAsync(id);
            return Ok(new { message = deleted ? "Xóa chiến dịch thành công" : "Không thể xóa" });
        }

        // ------------------------------------------------------
        // Gắn khách hàng mục tiêu
        // ------------------------------------------------------
        [HttpPost("assign-customers/{id}")]
        public async Task<IActionResult> AssignTargetCustomers(string id, [FromBody] List<string> customerIds)
        {
            if (customerIds == null || customerIds.Count == 0)
                return BadRequest("Danh sách khách hàng trống!");

            bool result = await _service.AssignTargetCustomersAsync(id, customerIds);
            if (!result) return BadRequest("Không gán được khách hàng mục tiêu!");

            return Ok(new { message = "Gán khách hàng thành công" });
        }

        // ------------------------------------------------------
        // Lấy khách hàng mục tiêu (nếu bạn có hàm GetTargetCustomersAsync)
        // ------------------------------------------------------
        [HttpGet("target-customers/{id}")]
        public async Task<IActionResult> GetTargetCustomers(string id)
        {
            if (string.IsNullOrEmpty(id))
                return BadRequest("Campaign ID không được để trống.");

            try
            {
                var customers = await _service.GetTargetCustomersAsync(id);

                if (customers == null || !customers.Any())
                    return NotFound($"Không tìm thấy khách hàng mục tiêu cho chiến dịch {id}.");

                return Ok(customers);
            }
            catch (Exception ex)
            {
                // Log lỗi nếu cần
                return StatusCode(500, $"Lỗi khi lấy khách hàng mục tiêu: {ex.Message}");
            }
        }

    }
}
