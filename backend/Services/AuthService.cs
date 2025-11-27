using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;

namespace backend.Service
{
    public class AuthService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public AuthService(IConfiguration config)
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

        public async Task<User?> LoginAsync(string email, string password)
        {
            var cypher = $@"
                MATCH (u:User {{email: '{email}', password: '{password}'}})
                WHERE u.roleId = 'ROLE01' OR (u)-[:HAS_ROLE]->(:Role {{id: 'ROLE01'}})
                RETURN u";

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0) return null;

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            var row = data[0].GetProperty("row")[0];
            
            return JsonSerializer.Deserialize<User>(row.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }
    }
}
