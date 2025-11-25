using backend.Models;
using Neo4j.Driver;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Services
{
    public class AuthService
    {
        private readonly IDriver _driver;

        public AuthService(IDriver driver)
        {
            _driver = driver;
        }

        public async Task<User> Login(string username, string password)
        {
            using var session = _driver.AsyncSession();
            var query = @"
                MATCH (u:User {username: $username, password: $password})
                OPTIONAL MATCH (u)-[:HAS_ROLE]->(r:Role {id: 'admin'})
                RETURN u, r.id as roleId";
            
            var result = await session.RunAsync(query, new { username, password });
            
            if (!await result.FetchAsync()) return null;

            var record = result.Current;
            var roleId = record["roleId"] != null ? record["roleId"].As<string>() : null;

            if (roleId != "admin") return null; // Only allow admin

            var node = record["u"].As<INode>();
            
            return new User
            {
                Id = node.Properties.ContainsKey("id") ? node.Properties["id"].As<string>() : node.ElementId,
                Username = node.Properties["username"].As<string>(),
                Email = node.Properties.ContainsKey("email") ? node.Properties["email"].As<string>() : "",
                Status = node.Properties.ContainsKey("status") ? node.Properties["status"].As<string>() : "Active",
                RoleId = roleId
            };
        }

        public async Task<User> GetUserProfile(string userId)
        {
            using var session = _driver.AsyncSession();
            var query = @"
                MATCH (u:User)
                WHERE u.id = $userId
                RETURN u";

            var result = await session.RunAsync(query, new { userId });
            
            if (!await result.FetchAsync()) return null;
            
            var record = result.Current;
            var node = record["u"].As<INode>();

            return new User
            {
                Id = node.Properties.ContainsKey("id") ? node.Properties["id"].As<string>() : node.ElementId,
                Username = node.Properties["username"].As<string>(),
                Email = node.Properties.ContainsKey("email") ? node.Properties["email"].As<string>() : "",
                Status = node.Properties.ContainsKey("status") ? node.Properties["status"].As<string>() : "Active",
                RoleId = node.Properties.ContainsKey("roleId") ? node.Properties["roleId"].As<string>() : null
            };
        }

        public async Task<User> CreateUser(User user)
        {
            using var session = _driver.AsyncSession();
            var query = @"
                CREATE (u:User {
                    username: $username,
                    password: $password,
                    email: $email,
                    status: $status,
                    createdAt: $createdAt,
                    roleId: $roleId
                })
                RETURN u";

            var parameters = new
            {
                user.Username,
                user.Password,
                user.Email,
                user.Status,
                createdAt = user.CreatedAt.ToString("o"),
                user.RoleId
            };

            var result = await session.RunAsync(query, parameters);
            var record = await result.SingleAsync();
            var node = record["u"].As<INode>();

            user.Id = node.ElementId;
            return user;
        }
    }
}
