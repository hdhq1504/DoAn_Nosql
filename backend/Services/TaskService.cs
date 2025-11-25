using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;
using TaskModel = backend.Models.Task;

namespace backend.Service
{
    public class TaskService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public TaskService(IConfiguration config)
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
        // GET /api/tasks – lấy tất cả task
        // ----------------------------
        public async Task<IEnumerable<TaskModel>> GetAllTastAsync()
        {
            var cypher = "MATCH(t:Task) RETURN t";
            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d => JsonSerializer.Deserialize<TaskModel>(d.GetProperty("row")[0].GetRawText()))
                .Where(c => c != null)!;

            return results;
        }

        // ----------------------------
        // POST /api/tasks – tạo task mới, gán nhân viên
        // ----------------------------
        public async Task<TaskModel?> CreateTaskAsync(TaskModel task, string employeeId)
        {
            var cypher = $@"
            MATCH (e:Employee {{id:'{employeeId}'}})
            CREATE (t:Task {{
                id: '{task.id}', 
                title: '{task.title}', 
                description: '{task.description}', 
                priority: '{task.priority}', 
                status: '{task.status}', 
                type: '{task.type}', 
                dueDate: datetime('{task.dueDate:O}'), 
                createdDate: datetime('{task.createddate:O}'),
                relatedContractId: '{task.relatedContractId}',
                relatedProjectId: '{task.relatedProjectId}'
            }})
            MERGE (e)-[:ASSIGNED_TO]->(t)
            RETURN t";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;
            return JsonSerializer.Deserialize<TaskModel>(data[0].GetProperty("row")[0].GetRawText());
        }

        // ----------------------------
        // GET /api/employees/{id}/tasks – xem task của nhân viên
        // ----------------------------
        public async Task<IEnumerable<TaskModel>> GetTasksByEmployeeAsync(string employeeId)
        {
            var cypher = $@"MATCH (:Employee {{id:'{employeeId}'}})-[:ASSIGNED_TO]->(t:Task) RETURN t";
            var doc = await RunCypherAsync(cypher);

            return doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d => JsonSerializer.Deserialize<TaskModel>(d.GetProperty("row")[0].GetRawText())!)
                .ToList();
        }

        // ----------------------------
        // PATCH /api/tasks/{id}/reassign – thay đổi người chịu trách nhiệm
        // ----------------------------
        public async Task<bool> ReassignTaskAsync(string taskId, string newEmployeeId)
        {
            var cypher = $@"
            MATCH (t:Task {{id:'{taskId}'}})<-[r:ASSIGNED_TO]-()
            DELETE r
            WITH t
            MATCH (e:Employee {{id:'{newEmployeeId}'}})
            MERGE (e)-[:ASSIGNED_TO]->(t)
            RETURN t.id";

            var doc = await RunCypherAsync(cypher);
            return doc.RootElement.GetProperty("results")[0].GetProperty("data").GetArrayLength() > 0;
        }

        // ----------------------------
        // GET /api/tasks/kanban – trả về task phân nhóm theo trạng thái
        // ----------------------------
        public async Task<Dictionary<string, List<TaskModel>>> GetKanbanAsync()
        {
            var cypher = @"MATCH (t:Task) RETURN t";
            var doc = await RunCypherAsync(cypher);

            var tasks = doc.RootElement
                .GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d => JsonSerializer.Deserialize<TaskModel>(d.GetProperty("row")[0].GetRawText())!)
                .ToList();

            return tasks.GroupBy(t => t.status)
                        .ToDictionary(g => g.Key, g => g.ToList());
        }

        // ----------------------------
        // PATCH /api/tasks/{id}/status – cập nhật trạng thái task
        // ----------------------------
        public async Task<TaskModel?> UpdateTaskStatusAsync(string taskId, string newStatus)
        {
            var cypher = $@"
            MATCH (t:Task {{id:'{taskId}'}})
            SET t.status = '{newStatus}'
            RETURN t";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;
            return JsonSerializer.Deserialize<TaskModel>(data[0].GetProperty("row")[0].GetRawText());
        }

        // ----------------------------
        // PUT /api/tasks/{id} – cập nhật thông tin task
        // ----------------------------
        public async Task<TaskModel?> UpdateTaskAsync(string id, TaskModel task)
        {
            var cypher = $@"
            MATCH (t:Task {{id:'{id}'}})
            SET t.title = '{task.title}',
                t.description = '{task.description}',
                t.priority = '{task.priority}',
                t.status = '{task.status}',
                t.type = '{task.type}',
                t.dueDate = datetime('{task.dueDate:O}'),
                t.relatedContractId = '{task.relatedContractId}',
                t.relatedProjectId = '{task.relatedProjectId}'
            RETURN t";

            var doc = await RunCypherAsync(cypher);
            var data = doc.RootElement.GetProperty("results")[0].GetProperty("data");

            if (data.GetArrayLength() == 0) return null;
            return JsonSerializer.Deserialize<TaskModel>(data[0].GetProperty("row")[0].GetRawText());
        }

        // ----------------------------
        // DELETE /api/tasks/{id} – xóa task
        // ----------------------------
        public async Task<bool> DeleteTaskAsync(string id)
        {
            var cypher = $@"
            MATCH (t:Task {{id:'{id}'}})
            DETACH DELETE t";

            await RunCypherAsync(cypher);
            return true;
        }

        // ----------------------------
        // GET /api/employees/kpi – bảng KPI tất cả nhân viên
        // ----------------------------
        public async Task<IEnumerable<KPI>> GetAllKPIsAsync()
        {
            var cypher = @"
                MATCH (e:Employee)
                OPTIONAL MATCH (e)-[:ASSIGNED_TO]->(t:Task)
                RETURN e.id AS employeeId, e.name AS employeeName, e.performanceScore AS performanceScore,
                    COUNT(t) AS totalTasks,
                    SUM(CASE t.status WHEN 'Completed' THEN 1 ELSE 0 END) AS completedTasks,
                    SUM(CASE t.status WHEN 'Pending' THEN 1 ELSE 0 END) AS pendingTasks,
                    SUM(CASE t.status WHEN 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks";

            var doc = await RunCypherAsync(cypher);

            return doc.RootElement.GetProperty("results")[0]
                .GetProperty("data")
                .EnumerateArray()
                .Select(d =>
                {
                    var row = d.GetProperty("row");

                    double GetDoubleSafe(int index) => row.GetArrayLength() > index && row[index].ValueKind == JsonValueKind.Number
                                                    ? row[index].GetDouble()
                                                    : 0.0;

                    int GetIntSafe(int index) => row.GetArrayLength() > index && row[index].ValueKind == JsonValueKind.Number
                                                ? row[index].GetInt32()
                                                : 0;

                    string GetStringSafe(int index) => row.GetArrayLength() > index && row[index].ValueKind == JsonValueKind.String
                                                    ? row[index].GetString()!
                                                    : "";

                    return new KPI
                    {
                        employeeId = GetStringSafe(0),
                        employeeName = GetStringSafe(1),
                        performanceScore = GetDoubleSafe(2),
                        totalTasks = GetIntSafe(3),
                        completedTasks = GetIntSafe(4),
                        pendingTasks = GetIntSafe(5),
                        inProgressTasks = GetIntSafe(6)
                    };
                })
                .ToList();
        }

        // ----------------------------
        // GET /api/employees/{id}/kpi – KPI cá nhân
        // ----------------------------
        public async Task<KPI?> GetKPIByEmployeeIdAsync(string employeeId)
        {
            if (string.IsNullOrWhiteSpace(employeeId))
                throw new ArgumentException("EmployeeId is required.", nameof(employeeId));

            var cypher = $@"
                MATCH (e:Employee {{id:'{employeeId}'}})
                OPTIONAL MATCH (e)-[:ASSIGNED_TO]->(t:Task)
                RETURN e.id AS employeeId,
                    e.name AS employeeName,
                    e.performanceScore AS performanceScore,
                    COUNT(t) AS totalTasks,
                    SUM(CASE t.status WHEN 'Completed' THEN 1 ELSE 0 END) AS completedTasks,
                    SUM(CASE t.status WHEN 'Pending' THEN 1 ELSE 0 END) AS pendingTasks,
                    SUM(CASE t.status WHEN 'In Progress' THEN 1 ELSE 0 END) AS inProgressTasks";

            var doc = await RunCypherAsync(cypher);

            var dataArray = doc.RootElement
                            .GetProperty("results")[0]
                            .GetProperty("data")
                            .EnumerateArray();

            var rowElement = dataArray.FirstOrDefault().GetProperty("row");

            double GetDoubleSafe(int index) => rowElement.GetArrayLength() > index && rowElement[index].ValueKind == JsonValueKind.Number
                                            ? rowElement[index].GetDouble()
                                            : 0.0;

            int GetIntSafe(int index) => rowElement.GetArrayLength() > index && rowElement[index].ValueKind == JsonValueKind.Number
                                        ? rowElement[index].GetInt32()
                                        : 0;

            string GetStringSafe(int index) => rowElement.GetArrayLength() > index && rowElement[index].ValueKind == JsonValueKind.String
                                            ? rowElement[index].GetString()!
                                            : "";

            return new KPI
            {
                employeeId = GetStringSafe(0),
                employeeName = GetStringSafe(1),
                performanceScore = GetDoubleSafe(2),
                totalTasks = GetIntSafe(3),
                completedTasks = GetIntSafe(4),
                pendingTasks = GetIntSafe(5),
                inProgressTasks = GetIntSafe(6)
            };
        }
    }        
}
