# 🚀 Quick Start Guide - DoAn_Nosql

> **Quick reference for getting the DoAn_Nosql CRM system up and running**

## Prerequisites Checklist

- [ ] .NET 9.0 SDK installed
- [ ] Node.js (v16+) and npm installed
- [ ] Neo4j Database installed and running
- [ ] Git (for version control)

---

## 🗄️ Database Setup (5 minutes)

### Step 1: Start Neo4j

**Option A: Neo4j Desktop** (Recommended for beginners)

1. Download and install [Neo4j Desktop](https://neo4j.com/download/)
2. Create a new project
3. Add a local database named "doan"
4. Set password to `12345678` (or update `backend/appsettings.json`)
5. Start the database

**Option B: Neo4j Community Edition**

```bash
# Start Neo4j service
neo4j start
```

### Step 2: Create Database

1. Open Neo4j Browser: `http://localhost:7474`
2. Login with credentials (default: neo4j/neo4j, then change password)
3. Run:

```cypher
CREATE DATABASE doan;
:use doan;
```

---

## 🔧 Backend Setup (3 minutes)

```bash
# Navigate to backend directory
cd backend

# Restore dependencies
dotnet restore

# Build the project
dotnet build

# Run the backend
dotnet run
```

✅ **Verify**: Open `http://localhost:5000` - you should see Swagger UI

---

## 🎨 Frontend Setup (3 minutes)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

✅ **Verify**: Browser should open automatically at `http://127.0.0.1:3001`

---

## 🧪 Testing the Setup

### Test 1: Backend API

1. Open Swagger UI: `http://localhost:5000`
2. Try the `GET /api/customer` endpoint
3. Click "Try it out" → "Execute"
4. You should get a 200 response (may be empty array initially)

### Test 2: Frontend

1. Open `http://127.0.0.1:3001`
2. You should see the dashboard
3. Navigate through sidebar menu items

### Test 3: Database Connection

1. Open Neo4j Browser: `http://localhost:7474`
2. Run: `MATCH (n) RETURN count(n);`
3. Should return a count (0 if no data yet)

---

## 📊 Project Ports Reference

| Service          | Port      | URL                   |
| ---------------- | --------- | --------------------- |
| Frontend (React) | 3001      | http://127.0.0.1:3001 |
| Backend API      | 5000/5001 | http://localhost:5000 |
| Swagger UI       | 5000/5001 | http://localhost:5000 |
| Neo4j Browser    | 7474      | http://localhost:7474 |
| Neo4j Bolt       | 7687      | bolt://localhost:7687 |

---

## 🛠️ Common Commands

### Backend

```bash
# Run backend
cd backend
dotnet run

# Build
dotnet build

# Clean build
dotnet clean
dotnet build

# Add package
dotnet add package PackageName
```

### Frontend

```bash
# Run frontend
cd frontend/reactjs
npm start

# Build for production
npm run build

# Run tests
npm test

# Install package
npm install package-name
```

### Database

```cypher
-- View all nodes
MATCH (n) RETURN n LIMIT 25;

-- View all customers
MATCH (c:Customer) RETURN c;

-- Clear all data (CAUTION!)
MATCH (n) DETACH DELETE n;

-- Create sample customer
CREATE (c:Customer {
  id: 'C001',
  name: 'John Doe',
  email: 'john@example.com',
  segment: 'VIP'
}) RETURN c;
```

---

## 🔍 Troubleshooting

### Backend won't start

```bash
# Check if port 5000/5001 is in use
netstat -ano | findstr :5000

# Kill process if needed (Windows)
taskkill /PID <PID> /F

# Check .NET version
dotnet --version  # Should be 9.0.x
```

### Frontend won't start

```bash
# Check if port 3001 is in use
netstat -ano | findstr :3001

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be v16+
```

### Can't connect to Neo4j

1. Verify Neo4j is running: Check Neo4j Desktop or run `neo4j status`
2. Check credentials in `backend/appsettings.json`
3. Verify database name is "doan"
4. Test connection in Neo4j Browser: `http://localhost:7474`

### CORS errors in browser console

- Backend should allow all origins in development
- Check `Program.cs` for CORS configuration
- Restart backend after changes

---

## 📁 Project Structure (Quick Reference)

```
DoAn_Nosql/
├── backend/                    # .NET 9.0 API
│   ├── Controllers/            # API endpoints
│   ├── Services/               # Business logic
│   ├── Models/                 # Data models
│   └── Program.cs              # Entry point
│
└── frontend/reactjs/           # React app
    └── src/
        ├── components/         # UI components
        ├── pages/              # Feature pages
        └── App.js              # Main app
```

---

## 🎯 First Development Task

Try adding a new customer through the API:

1. **Open Swagger UI**: `http://localhost:5000`
2. **Find**: `POST /api/customer/create`
3. **Click**: "Try it out"
4. **Paste** this JSON:

```json
{
  "id": "C001",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "phone": "123-456-7890",
  "segment": "VIP",
  "address": "123 Main St"
}
```

5. **Click**: "Execute"
6. **Verify** in Neo4j Browser:

```cypher
MATCH (c:Customer {id: 'C001'}) RETURN c;
```

---

## 📚 Next Steps

1. ✅ Read [NEWCOMER_GUIDE.md](./NEWCOMER_GUIDE.md) for comprehensive documentation
2. ✅ Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system architecture
3. ✅ Explore the API endpoints in Swagger UI
4. ✅ Try creating customers, products, and campaigns
5. ✅ Experiment with Cypher queries in Neo4j Browser

---

## 🆘 Getting Help

- **Documentation**: See `NEWCOMER_GUIDE.md` and `ARCHITECTURE.md`
- **API Reference**: Swagger UI at `http://localhost:5000`
- **Neo4j Help**: [Neo4j Documentation](https://neo4j.com/docs/)
- **React Help**: [React Documentation](https://react.dev/)

---

## 🎓 Learning Resources

### Neo4j & Cypher

- [Cypher Query Language](https://neo4j.com/developer/cypher/)
- [Neo4j Sandbox](https://sandbox.neo4j.com/) - Practice Cypher queries

### .NET & ASP.NET Core

- [ASP.NET Core Tutorial](https://docs.microsoft.com/aspnet/core/tutorials/)
- [.NET 9.0 Documentation](https://docs.microsoft.com/dotnet/)

### React

- [React Tutorial](https://react.dev/learn)
- [React Hooks Guide](https://react.dev/reference/react)

---

**Ready to code! 🚀**

For detailed information, see [NEWCOMER_GUIDE.md](./NEWCOMER_GUIDE.md)
