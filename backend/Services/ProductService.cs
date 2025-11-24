using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;

namespace backend.Service
{
    public class ProductService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public ProductService(IConfiguration config)
        {
            _httpClient = new HttpClient();
            _url = config["Neo4j:Url"] ?? "http://localhost:7474";
            _username = config["Neo4j:Username"] ?? "neo4j";
            _password = config["Neo4j:Password"] ?? "12345678";
            _database = config["Neo4j:Database"] ?? "doan";

            var auth = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_username}:{_password}"));
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Basic", auth);

            _httpClient.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json")
            );
        }

        private async Task<JsonDocument> RunCypherAsync(string cypher)
        {
            var requestUrl = $"{_url}/db/{_database}/tx/commit";
            var payload = new { statements = new[] { new { statement = cypher } } };

            var content = new StringContent(
                JsonSerializer.Serialize(payload),
                Encoding.UTF8,
                "application/json"
            );

            var response = await _httpClient.PostAsync(requestUrl, content);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();

            return JsonDocument.Parse(json);
        }

        // GET /api/products — Lấy danh sách sản phẩm
        public async Task<IEnumerable<Product>> GetAllProductsAsync()
        {
            var cypher = "MATCH (p:Product) RETURN p";
            var doc = await RunCypherAsync(cypher);

            return doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d =>
                    JsonSerializer.Deserialize<Product>(d.GetProperty("row")[0].GetRawText())!
                );
        }

        // --------------------------------
        // GET /api/products/{id} — Chi tiết sản phẩm
        
        public async Task<Product?> GetProductByIdAsync(string id)
        {
            var cypher = $@"MATCH (p:Product {{id: '{id}'}}) RETURN p";
            var doc = await RunCypherAsync(cypher);

            var rows = doc.RootElement.GetProperty("results")[0].GetProperty("data");
            if (rows.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Product>(
                rows[0].GetProperty("row")[0].GetRawText()
            );
        }

        // POST /api/products — Tạo mới sản phẩm
        public async Task<Product?> CreateProductAsync(Product p)
        {
            var cypher = $@"
            CREATE (p:Product {{
                id:'{p.id}',
                name:'{p.name}',
                category:'{p.category}',
                price:{p.price},
                duration:{p.duration},
                description:'{p.description}',
                status:'{p.status}',
                commissionRate:{p.commissionRate}
            }})
            RETURN p";

            var doc = await RunCypherAsync(cypher);
            var rows = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (rows.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Product>(
                rows[0].GetProperty("row")[0].GetRawText()
            );
        }

        // ✅ PATCH /api/products/{id} — cập nhật
        public async Task<Product?> UpdateProductAsync(string id, Product p)
        {
            var cypher = $@"
            MATCH (prod:Product {{id:'{id}'}})
            SET 
                prod.name = '{p.name}',
                prod.category = '{p.category}',
                prod.price = {p.price},
                prod.duration = {p.duration},
                prod.description = '{p.description}',
                prod.status = '{p.status}',
                prod.commissionRate = {p.commissionRate}
            RETURN prod";

            var doc = await RunCypherAsync(cypher);
            var rows = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (rows.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Product>(
                rows[0].GetProperty("row")[0].GetRawText()
            );
        }

        // ✅ DELETE /api/products/{id}
        public async Task<bool> DeleteProductAsync(string id)
        {
            var cypher = $@"
            MATCH (p:Product {{id:'{id}'}})
            DETACH DELETE p
            RETURN true";

            var doc = await RunCypherAsync(cypher);
            return doc.RootElement.GetProperty("results")[0].GetProperty("data").GetArrayLength() > 0;
        }
    }
}
