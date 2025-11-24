using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;

namespace backend.Service
{
    public class CampaignService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public CampaignService(IConfiguration config)
        {
             _httpClient = new HttpClient();

            // REST API URL (HTTP, không phải bolt)
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

        // Tạo chiến dịch mới
        public async Task<Campaign?> CreateCampaignAsync(Campaign campaign)
        {
            // Nếu chưa có id, tự động sinh mã
            if (string.IsNullOrEmpty(campaign.id))
                campaign.id = "CAM" + Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            string cypher = $@"
                CREATE (c:Campaign {{
                    id:'{campaign.id}',
                    name:'{campaign.name}',
                    type:'{campaign.type}',
                    startDate:date('{campaign.startDate:yyyy-MM-dd}'),
                    endDate:date('{campaign.endDate:yyyy-MM-dd}'),
                    budget:{campaign.budget},
                    status:'{campaign.status}'
                }})
                RETURN c.id, c.name, c.type, c.startDate, c.endDate, c.budget, c.status";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0)
                return null;

            var row = data[0].GetProperty("row");

            // Map dữ liệu từ Neo4j trả về
            return new Campaign
            {
                id = row[0].GetString() ?? "",
                name = row[1].GetString() ?? "",
                type = row[2].GetString() ?? "",
                startDate = DateTime.Parse(row[3].GetString() ?? "2025-01-01"),
                endDate = DateTime.Parse(row[4].GetString() ?? "2025-01-01"),
                budget = row[5].GetDouble(),
                status = row[6].GetString() ?? ""
            };
        }

        // Lấy danh sách chiến dịch
        public async Task<IEnumerable<Campaign>> GetCampaignsAsync()
        {
            var cypher = @"MATCH (c:Campaign) RETURN c.id, c.name, c.type, c.startDate, c.endDate, c.budget, c.status ORDER BY c.startDate DESC";
            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            return data.EnumerateArray().Select(d =>
            {
                var row = d.GetProperty("row");
                return new Campaign
                {
                    id = row[0].GetString() ?? "",
                    name = row[1].GetString() ?? "",
                    type = row[2].GetString() ?? "",
                    startDate = DateTime.Parse(row[3].GetString() ?? "2025-01-01"),
                    endDate = DateTime.Parse(row[4].GetString() ?? "2025-01-01"),
                    budget = row[5].GetDouble(),
                    status = row[6].GetString() ?? ""
                };
            });
        }

        // Xem chi tiết chiến dịch
        public async Task<Campaign?> GetCampaignByidAsync(string id)
        {
            var cypher = $"MATCH (c:Campaign {{id:'{id}'}}) RETURN c.id, c.name, c.type, c.startDate, c.endDate, c.budget, c.status";
            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            var row = data[0].GetProperty("row");
            return new Campaign
            {
                id = row[0].GetString() ?? "",
                name = row[1].GetString() ?? "",
                type = row[2].GetString() ?? "",
                startDate = DateTime.Parse(row[3].GetString() ?? "2025-01-01"),
                endDate = DateTime.Parse(row[4].GetString() ?? "2025-01-01"),
                budget = row[5].GetDouble(),
                status = row[6].GetString() ?? ""
            };
        }

        // Cập nhật chiến dịch
        public async Task<Campaign?> UpdateCampaignAsync(string id, CampaignRequest req)
        {
            string cypher = $@"
                MATCH (c:Campaign {{id:'{id}'}})
                SET c.name = '{req.name}',
                    c.type = '{req.type}',
                    c.startDate = date('{req.startDate:yyyy-MM-dd}'),
                    c.endDate = date('{req.endDate:yyyy-MM-dd}'),
                    c.budget = {req.budget},
                    c.status = '{req.status}'
                RETURN c.id, c.name, c.type, c.startDate, c.endDate, c.budget, c.status";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0)
                return null;

            var row = data[0].GetProperty("row");

            return new Campaign
            {
                id = row[0].GetString() ?? "",
                name = row[1].GetString() ?? "",
                type = row[2].GetString() ?? "",
                startDate = DateTime.Parse(row[3].GetString() ?? "2025-01-01"),
                endDate = DateTime.Parse(row[4].GetString() ?? "2025-01-01"),
                budget = row[5].GetDouble(),
                status = row[6].GetString() ?? ""
            };
        }


        // Xóa chiến dịch
        public async Task<bool> DeleteCampaignAsync(string id)
        {
            var cypher = $"MATCH (c:Campaign {{id:'{id}'}}) DETACH DELETE c";
            await RunCypherAsync(cypher);
            return true;
        }

        // Gắn phân khúc khách hàng mục tiêu
        public async Task<bool> AssignTargetCustomersAsync(string campaignid, List<string> customerids)
        {
            if (string.IsNullOrEmpty(campaignid) || customerids == null || customerids.Count == 0)
                return false;

            // Chuyển danh sách ID thành chuỗi ["CUS001","CUS002","CUS003"]
            string customerList = string.Join(",", customerids.Select(id => $"'{id}'"));

            // Cypher gắn toàn bộ trong 1 câu lệnh
            string cypher = $@"
                MATCH (c:Campaign {{id: '{campaignid}'}})
                WITH c
                MATCH (cust:Customer)
                WHERE cust.id IN [{customerList}]
                MERGE (c)-[:TARGETS]->(cust)
                RETURN COUNT(cust) AS assignedCount";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0)
                return false;

            int assignedCount = data[0].GetProperty("row")[0].GetInt32();
            return assignedCount > 0;
        }

        // Lấy danh sách khách hàng mục tiêu của một chiến dịch
        public async Task<IEnumerable<TargetCustomer>> GetTargetCustomersAsync(string campaignid)
        {
            if (string.IsNullOrEmpty(campaignid))
                return Enumerable.Empty<TargetCustomer>();

            string cypher = $@"
                MATCH (c:Campaign {{id:'{campaignid}'}})-[:TARGETS]->(cust:Customer)
                RETURN DISTINCT cust.id, cust.name, cust.segment, cust.email, cust.phone";

            var doc = await RunCypherAsync(cypher);
            var results = doc.RootElement.GetProperty("results")[0].GetProperty("data");
            return results.EnumerateArray().Select(d =>
            {
                var row = d.GetProperty("row");
                return new TargetCustomer
                {
                    id = row[0].GetString() ?? "",
                    name = row[1].GetString() ?? "",
                    segment = row[2].GetString() ?? "",
                    email = row[3].GetString() ?? "",
                    phone = row[4].GetString() ?? ""
                };
            }).ToList();
        }
    }
}
