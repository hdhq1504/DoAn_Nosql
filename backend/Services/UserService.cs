using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using backend.Models;
using backend.ViewModels;

namespace backend.Service
{
    public class UserService
    {
        private readonly HttpClient _httpClient;
        private readonly string _url;
        private readonly string _username;
        private readonly string _password;
        private readonly string _database;

        public UserService(IConfiguration config)
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

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            var cypher = $"MATCH (u:User {{email: '{email}'}}) RETURN u";
            var doc = await RunCypherAsync(cypher);

            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0) return null;

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            var row = data[0].GetProperty("row")[0];
            return JsonSerializer.Deserialize<User>(row.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        public async Task<User?> UpdateUserAsync(string id, User user)
        {
            var cypher = $@"
                MATCH (u:User {{id: '{id}'}})
                SET u.avatar = '{user.Avatar}',
                    u.phone = '{user.Phone}',
                    u.address = '{user.Address}',
                    u.bio = '{user.Bio}',
                    u.status = '{user.Status}',
                    u.roleId = '{user.RoleId}',
                    u.employeeId = '{user.EmployeeId}'
                
                WITH u
                // Update Role Relationship
                OPTIONAL MATCH (u)-[r:HAS_ROLE]->()
                DELETE r
                WITH u
                MATCH (newRole:Role {{id: '{user.RoleId}'}})
                MERGE (u)-[:HAS_ROLE]->(newRole)

                WITH u
                // Update Employee Relationship
                OPTIONAL MATCH (u)-[rel:IS_EMPLOYEE]->()
                DELETE rel
                WITH u
                OPTIONAL MATCH (e:Employee) 
                WHERE e.id = '{user.EmployeeId}' OR e.email = u.email
                FOREACH (_ IN CASE WHEN e IS NOT NULL THEN [1] ELSE [] END | MERGE (u)-[:IS_EMPLOYEE]->(e))
                
                RETURN u";

            var doc = await RunCypherAsync(cypher);
            var results = doc.RootElement.GetProperty("results");
            if (results.GetArrayLength() == 0) return null;

            var data = results[0].GetProperty("data");
            if (data.GetArrayLength() == 0) return null;

            var row = data[0].GetProperty("row")[0];
            return JsonSerializer.Deserialize<User>(row.GetRawText(), new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var cypher = $"MATCH (u:User {{id: '{id}'}}) DETACH DELETE u";
            try
            {
                await RunCypherAsync(cypher);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public async Task<(IEnumerable<UserViewModel> Users, int Total)> GetUsersAsync(int page, int pageSize, string search, string role = "")
        {
            var skip = (page - 1) * pageSize;
            var searchCondition = new List<string>();
            
            if (!string.IsNullOrEmpty(search))
            {
                searchCondition.Add($"(toLower(u.username) CONTAINS toLower('{search}') OR toLower(u.email) CONTAINS toLower('{search}'))");
            }

            if (!string.IsNullOrEmpty(role) && role != "All")
            {
                searchCondition.Add($"u.roleId = '{role}'");
            }

            var whereClause = searchCondition.Count > 0 ? "WHERE " + string.Join(" AND ", searchCondition) : "";

            var countCypher = $"MATCH (u:User) {whereClause} RETURN count(u)";
            var countDoc = await RunCypherAsync(countCypher);
            
            int total = 0;
            try 
            {
                var results = countDoc.RootElement.GetProperty("results");
                if (results.GetArrayLength() > 0)
                {
                    var data = results[0].GetProperty("data");
                    if (data.GetArrayLength() > 0)
                    {
                        total = data[0].GetProperty("row")[0].GetInt32();
                    }
                }
            }
            catch (Exception)
            {
                total = 0;
            }

            var cypher = $@"
                MATCH (u:User) 
                {whereClause}
                OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role)
                OPTIONAL MATCH (e:Employee {{email: u.email}})
                RETURN u, r.name as RoleName, e.name as EmployeeName, e.position as EmployeePosition, e.department as EmployeeDepartment
                SKIP {skip}
                LIMIT {pageSize}";

            var doc = await RunCypherAsync(cypher);
            var users = new List<UserViewModel>();

            try
            {
                var results = doc.RootElement.GetProperty("results");
                if (results.GetArrayLength() > 0)
                {
                    var data = results[0].GetProperty("data");
                    foreach (var item in data.EnumerateArray())
                    {
                        var row = item.GetProperty("row");
                        var userJson = row[0].GetRawText();
                        var userViewModel = JsonSerializer.Deserialize<UserViewModel>(userJson, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        
                        if (userViewModel != null)
                        {
                            if (row.GetArrayLength() > 1 && row[1].ValueKind != JsonValueKind.Null) 
                                userViewModel.RoleName = row[1].GetString();
                            
                            if (row.GetArrayLength() > 2 && row[2].ValueKind != JsonValueKind.Null) 
                                userViewModel.EmployeeName = row[2].GetString();

                            if (row.GetArrayLength() > 3 && row[3].ValueKind != JsonValueKind.Null) 
                                userViewModel.EmployeePosition = row[3].GetString();

                            if (row.GetArrayLength() > 4 && row[4].ValueKind != JsonValueKind.Null) 
                                userViewModel.EmployeeDepartment = row[4].GetString();

                            users.Add(userViewModel);
                        }
                    }
                }
            }
            catch (Exception)
            {
                // Handle parsing error
            }

            return (users, total);
        }

        public async Task<User?> CreateUserAsync(User user)
        {
            // Determine Role Name based on ID
            string roleName = "User";
            if (user.RoleId == "ROLE01") roleName = "Admin";
            else if (user.RoleId == "ROLE02") roleName = "Manager";
            else if (user.RoleId == "ROLE03") roleName = "Employee";

            var cypher = $@"
                CREATE (u:User {{
                    id: '{user.Id}',
                    username: '{user.Username}',
                    email: '{user.Email}',
                    password: '{user.Password}',
                    avatar: '{user.Avatar}',
                    roleId: '{user.RoleId}',
                    status: '{user.Status}',
                    createdat: datetime()
                }})
                WITH u
                MATCH (r:Role {{id: '{user.RoleId}'}})
                MERGE (u)-[:HAS_ROLE]->(r)
                WITH u
                OPTIONAL MATCH (e:Employee) 
                WHERE e.id = '{user.EmployeeId}' OR e.email = '{user.Email}'
                FOREACH (_ IN CASE WHEN e IS NOT NULL THEN [1] ELSE [] END | MERGE (u)-[:IS_EMPLOYEE]->(e))
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
