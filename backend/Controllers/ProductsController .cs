using Microsoft.AspNetCore.Mvc;
using backend.Models;
using backend.Service;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _service;

        public ProductController(ProductService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetAllProductsAsync());
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var p = await _service.GetProductByIdAsync(id);
            return p == null ? NotFound() : Ok(p);
        }

        [HttpPost]
        public async Task<IActionResult> Create(Product p)
        {
            var created = await _service.CreateProductAsync(p);
            return created == null ? BadRequest() : Ok(created);
        }

        [HttpPatch("{id}")]
        public async Task<IActionResult> Update(string id, Product p)
        {
            var updated = await _service.UpdateProductAsync(id, p);
            return updated == null ? NotFound() : Ok(updated);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteProductAsync(id);
            return success ? Ok() : NotFound();
        }
    }
}
