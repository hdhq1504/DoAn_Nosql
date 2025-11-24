using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ContractController : ControllerBase
    {
        private readonly ContractService _contractService;

        public ContractController(ContractService contractService)
        {
            _contractService = contractService;
        }

        // ------------------------------------------------------
        // GET /api/contracts
        // ------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetContracts(
            [FromQuery] string? customerId,
            [FromQuery] string? productId,
            [FromQuery] string? status)
        {
            var result = await _contractService.GetContractsAsync(customerId, productId, status);
            return Ok(result);
        }

        //------------------------------------------------------
        // GET /api/contracts/{id}
        // ------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetContractById(string id)
        {
            var result = await _contractService.GetContractByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        // ------------------------------------------------------
        // POST /api/contracts (tạo hợp đồng mới)
        // ------------------------------------------------------
        [HttpPost("create")]
        public async Task<IActionResult> CreateContract([FromBody] Contract request)
        {
            var result = await _contractService.CreateContractAsync(request);
            return CreatedAtAction(nameof(GetContractById), new { id = result!.id }, result);
        }

        // ------------------------------------------------------
        //  PATCH /api/contracts/{id} (cập nhật trạng thái hợp đồng)
        // ------------------------------------------------------
        [HttpPatch("tstatus/{id}")]
        public async Task<IActionResult> UpdateContract(string id, [FromBody] Contract request)
        {
            bool updated = await _contractService.UpdateContractAsync(id, request.status);
            if (!updated) return NotFound();
            return Ok(new { message = "Cập nhật hợp đồng thành công." });
        }

        // ------------------------------------------------------
        // DELETE /api/contracts/{id}
        // ------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteContract(string id)
        {
            bool success = await _contractService.DeleteContractAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        // ------------------------------------------------------
        // GET /api/contracts/{id}/commission
        // ------------------------------------------------------
        [HttpGet("commission/{id}")]
        public async Task<IActionResult> GetCommission(string id)
        {
            decimal commission = await _contractService.GetContractCommissionAsync(id);
            return Ok(new { contractId = id, commission });
        }
    }
}
