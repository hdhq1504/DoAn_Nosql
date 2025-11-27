using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;
using System.Threading.Tasks;

namespace backend.Service
{
    public class CustomerService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public CustomerService(IConfiguration config)
        {
            _httpClient = new HttpClient();

            _url = config["Neo4j:Url"] ?? "http://localhost:7474";
            _username = config["Neo4j:Username"] ?? "neo4j";
            _password = config["Neo4j:Password"] ?? "12345678";
            _database = config["Neo4j:Database"] ?? "doan";

            var auth = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_username}:{_password}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", auth);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        private async Task<JsonDocument> RunCypherAsync(string cypher)
        {
            var requestUrl = $"{_url}/db/{_database}/tx/commit";

            var payload = new
            {
                statements = new[]
                {
                    new { statement = cypher }
                }
            };

            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(requestUrl, content);

            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(json);
        }

        // Lấy tất cả khách hàng
        public async Task<IEnumerable<Customer>> GetAllCustomersAsync()
        {
            var cypher = "MATCH (c:Customer) RETURN c";
            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d =>
                    JsonSerializer.Deserialize<Customer>(
                        d.GetProperty("row")[0].GetRawText()
                    )
                )
                .Where(c => c != null)!;

            return results;
        }

        // Lấy khách hàng theo id (profile, journey, giao dịch)
        public async Task<Customer?> GetCustomerByIdAsync(string id)
        {
            var cypher = $"MATCH (c:Customer {{id: '{id}'}}) RETURN c";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Customer>(data[0].GetProperty("row")[0].GetRawText());
        }

        // Lấy danh sách khách hàng, có filter segment (VIP, Doanh nghiệp, Thường)
        public async Task<IEnumerable<Customer>> GetCustomersAsync(string? segment = null)
        {
            string cypher;
            if (string.IsNullOrEmpty(segment))
            {
                cypher = "MATCH (c:Customer) RETURN c";
            }
            else
            {
                cypher = $"MATCH (c:Customer {{segment: '{segment}'}}) RETURN c";
            }

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d => JsonSerializer.Deserialize<Customer>(d.GetProperty("row")[0].GetRawText()))
                .Where(c => c != null)!;

            return results;
        }

        // Lấy lịch sử tương tác (call, email, meeting)
        public async Task<IEnumerable<Interaction>> GetInteractionsAsync(string customerId)
        {
            var cypher = $@"
            MATCH (c:Customer {{id: '{customerId}'}})-[:HAS_INTERACTION]->(i:Interaction)
            RETURN i ORDER BY i.date DESC";

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d => JsonSerializer.Deserialize<Interaction>(d.GetProperty("row")[0].GetRawText()))
                .Where(i => i != null)!;

            return results;
        }

        // Xem hành trình khách hàng (customer journey)
        public async Task<IEnumerable<Journey>> GetCustomerJourneyAsync(string customerId)
        {
            var cypher = $@"
            MATCH (c:Customer {{id: '{customerId}'}})-[:HAS_JOURNEY]->(j:Journey)
            RETURN j ORDER BY j.date ASC";

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d => JsonSerializer.Deserialize<Journey>(d.GetProperty("row")[0].GetRawText()))
                .Where(j => j != null)!;

            return results;
        }
        
        // Tạo khách hàng mới (POST /api/customers)
        public async Task<Customer?> CreateCustomerAsync(Customer customer)
        {
            string createdDateStr = customer.createddate.ToString("yyyy-MM-ddTHH:mm:ss");
            string lastContactStr = customer.lastcontact.ToString("yyyy-MM-ddTHH:mm:ss");

            var cypher = $@"
            CREATE (c:Customer {{
                id: '{customer.id}',
                name: '{customer.name}',
                phone: '{customer.phone}',
                email: '{customer.email}',
                type: '{customer.type}',
                address: '{customer.address}',
                status: '{customer.status}',
                segment: '{customer.segment}',
                createddate: datetime('{createdDateStr}'),
                lifetimeValue: {customer.lifetimevalue},
                lastcontact: datetime('{lastContactStr}'),
                satisfactionScore: {customer.satisfactionScore}
            }})
            RETURN c";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Customer>(data[0].GetProperty("row")[0].GetRawText());
        }

        // Cập nhật thông tin khách hàng (PATCH)
        public async Task<Customer?> UpdateCustomerAsync(string id, Customer updatedCustomer)
        {
            string lastContactStr = updatedCustomer.lastcontact.ToString("yyyy-MM-ddTHH:mm:ss");
            string createdDateStr = updatedCustomer.createddate.ToString("yyyy-MM-ddTHH:mm:ss");

            var cypher = $@"
            MATCH (c:Customer {{id: '{id}'}})
            SET c.name = '{updatedCustomer.name}',
                c.phone = '{updatedCustomer.phone}',
                c.email = '{updatedCustomer.email}',
                c.type = '{updatedCustomer.type}',
                c.address = '{updatedCustomer.address}',
                c.status = '{updatedCustomer.status}',
                c.segment = '{updatedCustomer.segment}',
                c.lifetimevalue = {updatedCustomer.lifetimevalue},
                c.satisfactionScore = {updatedCustomer.satisfactionScore},
                c.lastcontact = datetime('{lastContactStr}'),
                c.createddate = datetime('{createdDateStr}')
            RETURN c";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Customer>(data[0].GetProperty("row")[0].GetRawText());
        }

        // Xóa khách hàng (DELETE)
        public async Task<bool> DeleteCustomerAsync(string id)
        {
            var cypher = $"MATCH (c:Customer {{id: '{id}'}}) DETACH DELETE c";

            var doc = await RunCypherAsync(cypher);

            return true; 
        }

        // Thêm tương tác mới (POST)
        public async Task<Interaction?> AddInteractionAsync(string customerId, Interaction interaction)
        {
            var cypher = $@"
            MATCH (c:Customer {{id: '{customerId}'}})
            CREATE (i:Interaction {{
                id: '{interaction.id}',
                type: '{interaction.type}',
                description: '{interaction.description}',
                date: datetime()
            }})
            CREATE (c)-[:HAS_INTERACTION]->(i)
            RETURN i";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Interaction>(data[0].GetProperty("row")[0].GetRawText());
        }

        // Thêm giai đoạn hành trình mới (POST)
        public async Task<Journey?> AddJourneyStageAsync(string customerId, Journey journey)
        {
            var cypher = $@"
            MATCH (c:Customer {{id: '{customerId}'}})
            CREATE (j:Journey {{
                step: '{journey.step}',
                detail: '{journey.detail}',
                date: datetime()
            }})
            CREATE (c)-[:HAS_JOURNEY]->(j)
            RETURN j";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Journey>(data[0].GetProperty("row")[0].GetRawText());
        }
    }
}
