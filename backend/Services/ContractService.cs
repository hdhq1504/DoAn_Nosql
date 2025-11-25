using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;

namespace backend.Service
{
    public class ContractService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public ContractService(IConfiguration config)
        {
            _url = config["Neo4j:Url"] ?? "http://localhost:7474";
            _username = config["Neo4j:Username"] ?? "neo4j";
            _password = config["Neo4j:Password"] ?? "12345678";
            _database = config["Neo4j:Database"] ?? "doan";

            _httpClient = new HttpClient();
            var auth = Convert.ToBase64String(Encoding.ASCII.GetBytes($"{_username}:{_password}"));
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", auth);
            _httpClient.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        private async Task<JsonDocument> ExecuteCypherAsync(string cypher)
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

        private decimal CalculateCommission(decimal contractValue, decimal commissionRate)
        {
            return contractValue * commissionRate;
        }

        // ------------------------------------------------------
        // GET /api/contracts → danh sách hợp đồng 
        // ------------------------------------------------------
        public async Task<IEnumerable<Contract>> GetContractsAsync()
        {
            var cypher = @"
                MATCH (c:Customer)-[r:OWNS]->(p:Product)
                RETURN 
                    r.id AS id,
                    c.id AS customerId,
                    p.id AS productId,
                    r.purchaseDate AS purchaseDate,
                    r.expiryDate AS expiryDate,
                    r.status AS status,
                    r.contractValue AS contractValue,
                    r.commission AS commission
            ";

            var doc = await ExecuteCypherAsync(cypher);
            var results = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data");

            var contracts = results.EnumerateArray().Select(row =>
            {
                var r = row.GetProperty("row");
                return new Contract
                {
                    id = r[0].GetString() ?? "",
                    customerId = r[1].GetString() ?? "",
                    productId = r[2].GetString() ?? "",
                    purchaseDate = DateTime.Parse(r[3].GetString() ?? DateTime.Now.ToString()),
                    expiryDate = DateTime.Parse(r[4].GetString() ?? DateTime.Now.ToString()),
                    status = r[5].GetString() ?? "",
                    contractValue = r[6].GetDecimal(),
                    commission = r[7].GetDecimal()
                };
            }).ToList();

            return contracts;
        }

        // ------------------------------------------------------
        // POST /api/contracts → tạo hợp đồng mới (auto hoa hồng)
        // ------------------------------------------------------
        public async Task<Contract?> CreateContractAsync(Contract contract)
        {
            decimal commission = CalculateCommission(contract.contractValue, contract.commissionRate);
            var cypher = $@"
                MATCH (c:Customer {{ id: '{contract.customerId}' }}),
                    (p:Product {{ id: '{contract.productId}' }})
                CREATE (c)-[r:OWNS {{
                    id: '{contract.id}',
                    purchaseDate: date('{contract.purchaseDate:yyyy-MM-dd}'),
                    expiryDate: date('{contract.expiryDate:yyyy-MM-dd}'),
                    status: '{contract.status}',
                    contractValue: {contract.contractValue},
                    commission: {commission},
                    commissionRate: {contract.commissionRate}
                }}]->(p)
                RETURN r
            ";
            var doc = await ExecuteCypherAsync(cypher);

            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0) return null;

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            var row = data[0].GetProperty("row")[0];

            contract.id = row.GetProperty("id").GetString();
            contract.status = row.GetProperty("status").GetString();
            contract.contractValue = row.GetProperty("contractValue").GetDecimal();
            contract.commission = row.GetProperty("commission").GetDecimal();
            contract.commissionRate = row.GetProperty("commissionRate").GetDecimal();
            contract.purchaseDate = DateTime.Parse(row.GetProperty("purchaseDate").GetString());
            contract.expiryDate = DateTime.Parse(row.GetProperty("expiryDate").GetString());

            return contract;
        }


        // ------------------------------------------------------
        // GET /api/contracts → danh sách hợp đồng (có thể filter)
        // ------------------------------------------------------
        public async Task<IEnumerable<Contract>> GetContractsAsync(
            string? customerId = null, string? productId = null, string? status = null)
        {
            var filter = new List<string>();
            if (!string.IsNullOrEmpty(customerId)) filter.Add($"c.id = '{customerId}'");
            if (!string.IsNullOrEmpty(productId)) filter.Add($"p.id = '{productId}'");
            if (!string.IsNullOrEmpty(status)) filter.Add($"r.status = '{status}'");

            string whereClause = filter.Count > 0 ? "WHERE " + string.Join(" AND ", filter) : "";

            var cypher = $@"
                MATCH (c:Customer)-[r:OWNS]->(p:Product)
                {whereClause}
                RETURN 
                    r.id AS id,
                    c.id AS customerId,
                    p.id AS productId,
                    r.purchaseDate AS purchaseDate,
                    r.expiryDate AS expiryDate,
                    r.status AS status,
                    r.contractValue AS contractValue,
                    r.commission AS commission
            ";

            var doc = await ExecuteCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            return data.EnumerateArray().Select(row =>
            {
                var r = row.GetProperty("row");
                return new Contract
                {
                    id = r[0].GetString() ?? "",
                    customerId = r[1].GetString() ?? "",
                    productId = r[2].GetString() ?? "",
                    purchaseDate = DateTime.Parse(r[3].GetString() ?? DateTime.Now.ToString()),
                    expiryDate = DateTime.Parse(r[4].GetString() ?? DateTime.Now.ToString()),
                    status = r[5].GetString() ?? "",
                    contractValue = r[6].GetDecimal(),
                    commission = r[7].GetDecimal()
                };
            }).ToList();
        }

        // ------------------------------------------------------
        // GET /api/contracts/{id} → xem chi tiết hợp đồng
        // ------------------------------------------------------
        public async Task<Contract?> GetContractByIdAsync(string id)
        {
            var cypher = $@"
                MATCH (c:Customer)-[r:OWNS {{id:'{id}'}}]->(p:Product)
                RETURN 
                    r.id AS id,
                    c.id AS customerId,
                    p.id AS productId,
                    r.purchaseDate AS purchaseDate,
                    r.expiryDate AS expiryDate,
                    r.status AS status,
                    r.contractValue AS contractValue,
                    r.commission AS commission
            ";

            var doc = await ExecuteCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            var r = data[0].GetProperty("row");
            return new Contract
            {
                id = r[0].GetString() ?? "",
                customerId = r[1].GetString() ?? "",
                productId = r[2].GetString() ?? "",
                purchaseDate = DateTime.Parse(r[3].GetString() ?? DateTime.Now.ToString()),
                expiryDate = DateTime.Parse(r[4].GetString() ?? DateTime.Now.ToString()),
                status = r[5].GetString() ?? "",
                contractValue = r[6].GetDecimal(),
                commission = r[7].GetDecimal()
            };
        }

        // ------------------------------------------------------
        // PATCH /api/contracts/{id} → cập nhật trạng thái của hợp đồng
        // ------------------------------------------------------
        public async Task<bool> UpdateContractAsync(string id, string newStatus)
        {
            var cypher = $@"
                MATCH (:Customer)-[r:OWNS {{id:'{id}'}}]->(:Product)
                SET r.status = '{newStatus}'
                RETURN r.id
            ";

            var doc = await ExecuteCypherAsync(cypher);
            return doc.RootElement.GetProperty("results")[0].GetProperty("data").GetArrayLength() > 0;
        }

        // ------------------------------------------------------
        // PUT /api/contracts/{id} → cập nhật toàn bộ thông tin hợp đồng
        // ------------------------------------------------------
        public async Task<Contract?> UpdateContractFullAsync(string id, Contract contract)
        {
            decimal commission = CalculateCommission(contract.contractValue, contract.commissionRate);
            
            var cypher = $@"
                MATCH (:Customer)-[r:OWNS {{id:'{id}'}}]->(:Product)
                SET r.purchaseDate = date('{contract.purchaseDate:yyyy-MM-dd}'),
                    r.expiryDate = date('{contract.expiryDate:yyyy-MM-dd}'),
                    r.status = '{contract.status}',
                    r.contractValue = {contract.contractValue},
                    r.commission = {commission},
                    r.commissionRate = {contract.commissionRate}
                RETURN r
            ";

            var doc = await ExecuteCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            var row = data[0].GetProperty("row")[0];
            
            return new Contract
            {
                id = row.GetProperty("id").GetString() ?? id,
                customerId = contract.customerId,
                productId = contract.productId,
                purchaseDate = DateTime.Parse(row.GetProperty("purchaseDate").GetString() ?? DateTime.Now.ToString()),
                expiryDate = DateTime.Parse(row.GetProperty("expiryDate").GetString() ?? DateTime.Now.ToString()),
                status = row.GetProperty("status").GetString() ?? "",
                contractValue = row.GetProperty("contractValue").GetDecimal(),
                commission = row.GetProperty("commission").GetDecimal(),
                commissionRate = row.GetProperty("commissionRate").GetDecimal()
            };
        }

        // ------------------------------------------------------
        // DELETE /api/contracts/{id} → xóa hợp đồng
        // ------------------------------------------------------
        public async Task<bool> DeleteContractAsync(string id)
        {
            var cypher = $@"
                MATCH (:Customer)-[r:OWNS {{id:'{id}'}}]->(:Product)
                DELETE r
                RETURN COUNT(r)
            ";

            var doc = await ExecuteCypherAsync(cypher);
            return true;
        }

        // ------------------------------------------------------
        // GET /api/contracts/{id}/commission → lấy hoa hồng
        // ------------------------------------------------------
        public async Task<decimal> GetContractCommissionAsync(string id)
        {
            var cypher = $@"
                MATCH (:Customer)-[r:OWNS {{id:'{id}'}}]->(:Product)
                RETURN r.commission
            ";

            var doc = await ExecuteCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return 0;
            return data[0].GetProperty("row")[0].GetDecimal();
        }
    }
}
