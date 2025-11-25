using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;

namespace backend.Service
{
    public class EmployeeService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public EmployeeService(IConfiguration config)
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

            var payload = new { statements = new[] { new { statement = cypher } } };
            var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync(requestUrl, content);
            response.EnsureSuccessStatusCode();
            var json = await response.Content.ReadAsStringAsync();
            return JsonDocument.Parse(json);
        }

        // ----------------------------
        // GET /api/employees
        // ----------------------------
        public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
        {
            var cypher = "MATCH (e:Employee) RETURN e";
            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d => JsonSerializer.Deserialize<Employee>(d.GetProperty("row")[0].GetRawText()))
                .Where(e => e != null)!;

            return results;
        }

        // ----------------------------
        // GET /api/employees/{id}
        // ----------------------------
        public async Task<Employee?> GetEmployeeByIdAsync(string id)
        {
            var cypher = $"MATCH (e:Employee {{id: '{id}'}}) RETURN e";
            var doc = await RunCypherAsync(cypher);

            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            return JsonSerializer.Deserialize<Employee>(data[0].GetProperty("row")[0].GetRawText());
        }

        // ----------------------------
        // POST /api/employees
        // ----------------------------
        public async Task<Employee?> CreateEmployeeAsync(Employee employee)
        {
            var cypher = $@"
            CREATE (e:Employee {{
                id: '{employee.id}',
                name: '{employee.name}',
                position: '{employee.position}',
                department: '{employee.department}',
                email: '{employee.email}',
                phone: '{employee.phone}',
                status: '{employee.status}',
                hiredate: datetime('{employee.hiredate:O}'),
                performanceScore: {employee.performanceScore}
            }})
            RETURN e";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;
            return JsonSerializer.Deserialize<Employee>(data[0].GetProperty("row")[0].GetRawText());
        }

        // ----------------------------
        // PUT /api/employees/{id}
        // ----------------------------
        public async Task<Employee?> UpdateEmployeeAsync(string id, Employee employee)
        {
            var cypher = $@"
            MATCH (e:Employee {{id: '{id}'}})
            SET e.name = '{employee.name}',
                e.position = '{employee.position}',
                e.department = '{employee.department}',
                e.email = '{employee.email}',
                e.phone = '{employee.phone}',
                e.status = '{employee.status}',
                e.hiredate = datetime('{employee.hiredate:O}'),
                e.performanceScore = {employee.performanceScore}
            RETURN e";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;
            return JsonSerializer.Deserialize<Employee>(data[0].GetProperty("row")[0].GetRawText());
        }

        // ----------------------------
        // DELETE /api/employees/{id}
        // ----------------------------
        public async Task<bool> DeleteEmployeeAsync(string id)
        {
            var cypher = $"MATCH (e:Employee {{id: '{id}'}}) DETACH DELETE e";
            await RunCypherAsync(cypher);
            return true;
        }
    }
}
