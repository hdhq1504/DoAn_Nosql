using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;

namespace backend.Service
{
    public class AnalyticsService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public AnalyticsService(IConfiguration config)
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

        // Hàm chạy query
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

        // ------------------------------
        // DASHBOARD METRICS
        // ------------------------------
        public async Task<DashboardMetrics> GetDashboardMetricsAsync()
        {
            var cypher = @"
                MATCH (c:Customer)
                WITH count(c) AS totalCustomers
                MATCH (e:Employee)
                WITH totalCustomers, count(e) AS totalEmployees
                MATCH (t:Task)
                WITH totalCustomers, totalEmployees, count(t) AS totalTasks
                OPTIONAL MATCH (:Customer)-[r:OWNS]->(p:Product)
                RETURN 
                    totalCustomers,
                    totalEmployees,
                    totalTasks,
                    coalesce(sum(p.price), 0) AS totalRevenue
            ";

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0)
                return new DashboardMetrics();

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0)
                return new DashboardMetrics();

            var row = data[0].GetProperty("row");

            var metrics = new DashboardMetrics
            {
                TotalCustomers = row[0].ValueKind == JsonValueKind.Number ? row[0].GetInt32() : 0,
                TotalEmployees = row[1].ValueKind == JsonValueKind.Number ? row[1].GetInt32() : 0,
                TotalTasks = row[2].ValueKind == JsonValueKind.Number ? row[2].GetInt32() : 0,
                TotalRevenue = row[3].ValueKind == JsonValueKind.Number ? row[3].GetDouble() : 0
            };
            return metrics;
        }

        // ------------------------------
        // SALES PIPELINE
        // ------------------------------
       public async Task<IEnumerable<SalesStage>> GetSalesPipelineAsync()
        {
            var cypher = @"
                MATCH (c:Customer)-[r:OWNS]->(p:Product)
                WITH p.category AS Stage, collect(r.contractValue) AS Values
                RETURN 
                    Stage,
                    size(Values) AS DealCount,
                    reduce(total = 0, v IN Values | total + coalesce(v, 0)) AS TotalValue,
                    round(
                        CASE WHEN size(Values) > 0 
                            THEN (reduce(total = 0, v IN Values | total + coalesce(v, 0))) / size(Values) 
                            ELSE 0 
                        END, 2
                    ) AS AverageDealValue
            ";

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0)
                return Enumerable.Empty<SalesStage>();

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0)
                return Enumerable.Empty<SalesStage>();

            var result = data.EnumerateArray().Select(d =>
            {
                var row = d.GetProperty("row");
                return new SalesStage
                {
                    Stage = row[0].GetString() ?? "Unknown",
                    DealCount = row[1].ValueKind == JsonValueKind.Number ? row[1].GetInt32() : 0,
                    TotalValue = row[2].ValueKind == JsonValueKind.Number ? row[2].GetDouble() : 0,
                    AverageDealValue = row[3].ValueKind == JsonValueKind.Number ? row[3].GetDouble() : 0
                };
            });

            return result;
        }

        // ------------------------------
        // CUSTOMER ANALYTICS
        // ------------------------------
        public async Task<IEnumerable<CustomerSegmentReport>> GetCustomerAnalyticsAsync()
        {
            var cypher = @"
                MATCH (c:Customer)
                OPTIONAL MATCH (c)-[:HAS_INTERACTION]->(i:Interaction)
                WITH c, c.segment AS Segment, count(i) AS InteractionCount
                WITH Segment,
                    count(c) AS CustomerCount,
                    round(avg(c.lifetimeValue), 2) AS AverageLTV,
                    round(avg(c.satisfactionScore), 2) AS AverageSatisfaction,
                    round(avg(InteractionCount), 2) AS AverageInteractions
                RETURN Segment, CustomerCount, AverageLTV, AverageSatisfaction, AverageInteractions
                ORDER BY CustomerCount DESC";

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0)
                return Enumerable.Empty<CustomerSegmentReport>();

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0)
                return Enumerable.Empty<CustomerSegmentReport>();

            var result = data.EnumerateArray().Select(d =>
            {
                var row = d.GetProperty("row");
                return new CustomerSegmentReport
                {
                    Segment = row[0].GetString() ?? "Unknown",
                    CustomerCount = row[1].GetInt32(),
                    AverageLTV = row[2].ValueKind == JsonValueKind.Number ? row[2].GetDouble() : 0,
                    AverageSatisfaction = row[3].ValueKind == JsonValueKind.Number ? row[3].GetDouble() : 0,
                    AverageInteractions = row[4].ValueKind == JsonValueKind.Number ? row[4].GetDouble() : 0
                };
            });

            return result;
        }


        // ------------------------------
        // 4EMPLOYEE PERFORMANCE
        // ------------------------------
        public async Task<IEnumerable<EmployeePerformance>> GetEmployeePerformanceAsync()
        {
            var cypher = @"
                MATCH (e:Employee)
                OPTIONAL MATCH (e)-[:ASSIGNED_TO]->(t:Task)
                OPTIONAL MATCH (e)-[:RESPONSIBLE_FOR]->(c:Customer)
                OPTIONAL MATCH (e)-[s:SOLD]->(p:Product)
                WITH e,
                    count(DISTINCT t) AS TotalTasks,
                    count(DISTINCT c) AS TotalCustomers,
                    coalesce(sum(s.commission), 0) AS TotalCommission,
                    coalesce(sum(p.price), 0) AS TotalRevenue
                RETURN 
                    e.id AS EmployeeId,
                    e.name AS EmployeeName,
                    TotalCustomers,
                    TotalTasks,
                    TotalCommission,
                    TotalRevenue,
                    coalesce(e.performanceScore, 0) AS PerformanceScore
            ";

            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0)
                return Enumerable.Empty<EmployeePerformance>();

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0)
                return Enumerable.Empty<EmployeePerformance>();

            var result = data.EnumerateArray().Select(d =>
            {
                var row = d.GetProperty("row");

                string employeeId = row[0].ValueKind == JsonValueKind.String ? row[0].GetString() ?? "" : "";
                string employeeName = row[1].ValueKind == JsonValueKind.String ? row[1].GetString() ?? "" : "";

                int totalCustomers = row[2].ValueKind == JsonValueKind.Number ? row[2].GetInt32() : 0;
                int totalTasks = row[3].ValueKind == JsonValueKind.Number ? row[3].GetInt32() : 0;
                double totalCommission = row[4].ValueKind == JsonValueKind.Number ? row[4].GetDouble() : 0;
                double totalRevenue = row[5].ValueKind == JsonValueKind.Number ? row[5].GetDouble() : 0;
                double performanceScore = row[6].ValueKind == JsonValueKind.Number ? row[6].GetDouble() : 0;

                return new EmployeePerformance
                {
                    EmployeeId = employeeId,
                    EmployeeName = employeeName,
                    TotalCustomers = totalCustomers,
                    CompletedTasks = totalTasks,
                    TotalCommission = totalCommission,
                    TotalRevenue = totalRevenue,
                    PerformanceScore = performanceScore
                };
            });

            return result;
        }


        // ------------------------------
        // REVENUE REPORT (theo tháng)
        // ------------------------------
        public async Task<IEnumerable<RevenueReport>> GetMonthlyRevenueReportAsync()
        {
            var cypher = @"
            MATCH (c:Customer)-[r:OWNS]->(p:Product)
            WITH date(r.purchaseDate) AS d, sum(r.contractValue) AS totalValue, sum(r.commission) AS totalCommission, count(r) AS contracts
            RETURN d.year AS Year, d.month AS Month, 
                   round(totalValue, 2) AS TotalRevenue, 
                   round(totalCommission, 2) AS TotalCommission,
                   contracts AS TotalContracts
            ORDER BY Year, Month";
    
            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            var result = data.EnumerateArray().Select(d =>
            {
                var row = d.GetProperty("row");
                return new RevenueReport
                {
                    Year = row[0].GetInt32(),
                    Month = row[1].GetInt32(),
                    TotalRevenue = row[2].GetDouble(),
                    TotalCommission = row[3].GetDouble(),
                    TotalContracts = row[4].GetInt32()
                };
            });

            return result;
        }
    }
}
