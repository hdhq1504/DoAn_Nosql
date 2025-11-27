using backend.Models;
using backend.Service;
using Microsoft.AspNetCore.Mvc;


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomerController : ControllerBase
    {
        private readonly CustomerService _service;

        public CustomerController(CustomerService service)
        {
            _service = service;
        }
        // ------------------------------------------------------
        // GET /api/customers
        // ------------------------------------------------------
        [HttpGet]
        public async Task<IActionResult> GetAllCustomers()
        {
            var customers = await _service.GetAllCustomersAsync();
            return Ok(customers);
        }

        // ------------------------------------------------------
        // GET /api/customers?segment=VIP
        // ------------------------------------------------------
        [HttpGet("filter")]
        public async Task<IActionResult> GetCustomersBySegment([FromQuery] string? segment)
        {
            var customers = await _service.GetCustomersAsync(segment);
            return Ok(customers);
        }

        // ------------------------------------------------------
        // GET /api/customers/{id}
        // ------------------------------------------------------
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomerById(string id)
        {
            var customer = await _service.GetCustomerByIdAsync(id);
            if (customer == null) return NotFound();
            return Ok(customer);
        }

        // ------------------------------------------------------
        // POST /api/customers
        // ------------------------------------------------------
        [HttpPost("create")]
        public async Task<IActionResult> CreateCustomer([FromBody] Customer customer)
        {
            var created = await _service.CreateCustomerAsync(customer);
            if (created == null) return BadRequest("Failed to create customer.");
            return CreatedAtAction(nameof(GetCustomerById), new { id = created.id }, created);
        }

        // ------------------------------------------------------
        // PATCH /api/customers/{id}
        // ------------------------------------------------------
        [HttpPatch("{id}")]
        public async Task<IActionResult> UpdateCustomer(string id, [FromBody] Customer updatedCustomer)
        {
            var updated = await _service.UpdateCustomerAsync(id, updatedCustomer);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        // ------------------------------------------------------
        // DELETE /api/customers/{id}
        // ------------------------------------------------------
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(string id)
        {
            var success = await _service.DeleteCustomerAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        // ------------------------------------------------------
        // GET /api/customers/{id}/interactions
        // ------------------------------------------------------
        [HttpGet("interactions/{id}")]
        public async Task<IActionResult> GetInteractions(string id)
        {
            var interactions = await _service.GetInteractionsAsync(id);
            return Ok(interactions);
        }

        // ------------------------------------------------------
        // POST /api/customers/{id}/interactions
        // ------------------------------------------------------
        [HttpPost("interactions/{id}")]
        public async Task<IActionResult> AddInteraction(string id, [FromBody] Interaction interaction)
        {
            var created = await _service.AddInteractionAsync(id, interaction);
            if (created == null) return BadRequest("Failed to add interaction.");
            return CreatedAtAction(nameof(GetInteractions), new { id }, created);
        }

        // ------------------------------------------------------
        // GET /api/customers/{id}/journey
        // ------------------------------------------------------
        [HttpGet("journey/{id}")]
        public async Task<IActionResult> GetCustomerJourney(string id)
        {
            var journey = await _service.GetCustomerJourneyAsync(id);
            return Ok(journey);
        }

        // ------------------------------------------------------
        // POST /api/customers/journey/{id}
        // ------------------------------------------------------
        [HttpPost("journey/{id}")]
        public async Task<IActionResult> AddJourneyStage(string id, [FromBody] Journey journey)
        {
            var created = await _service.AddJourneyStageAsync(id, journey);
            if (created == null) return BadRequest("Failed to add journey stage.");
            return CreatedAtAction(nameof(GetCustomerJourney), new { id }, created);
        }
    }
}
