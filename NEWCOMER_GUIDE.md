# 📚 Newcomer Guide - DoAn_Nosql Project

Welcome to the DoAn_Nosql project! This guide will help you understand the codebase structure, technologies used, and how to get started with development.

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Architecture](#architecture)
- [Development Workflow](#development-workflow)
- [API Documentation](#api-documentation)
- [Common Tasks](#common-tasks)

---

## 🎯 Project Overview

**DoAn_Nosql** is a Customer Relationship Management (CRM) system built with a modern tech stack, utilizing a graph database (Neo4j) for managing complex relationships between customers, products, campaigns, and tasks.

### Key Features

- **Customer Management**: Track customer profiles, segments (VIP, Business, Regular), and interactions
- **Campaign Management**: Create and manage marketing campaigns
- **Task Management**: Assign and track tasks related to customers and campaigns
- **Product Management**: Manage product catalog and customer-product relationships
- **Analytics & Reporting**: Generate insights from customer journeys and interactions
- **Contract Management**: Handle customer contracts and agreements

---

## 🛠️ Technology Stack

### Backend

| Technology          | Version | Purpose                                    |
| ------------------- | ------- | ------------------------------------------ |
| **.NET**            | 9.0     | Web API framework                          |
| **ASP.NET Core**    | 9.0     | RESTful API development                    |
| **Neo4j**           | 5.28.3  | Graph database for relationship management |
| **Neo4j.Driver**    | 5.28.3  | .NET driver for Neo4j HTTP API             |
| **Newtonsoft.Json** | 13.0.4  | JSON serialization/deserialization         |
| **Swagger/OpenAPI** | 9.0.6   | API documentation and testing              |

### Frontend

| Technology                | Version | Purpose                           |
| ------------------------- | ------- | --------------------------------- |
| **React**                 | 18.3.1  | UI framework                      |
| **React DOM**             | 18.3.1  | DOM rendering                     |
| **React Scripts**         | 5.0.1   | Build tooling (Create React App)  |
| **Axios**                 | 1.13.2  | HTTP client for API calls         |
| **React Icons**           | 5.5.0   | Icon library (Font Awesome, etc.) |
| **Lucide React**          | 0.554.0 | Modern icon library               |
| **XLSX**                  | 0.18.5  | Excel file generation/export      |
| **React Testing Library** | 13.4.0  | Component testing                 |
| **Jest DOM**              | 6.0.0   | DOM testing utilities             |
| **Web Vitals**            | 2.1.4   | Performance monitoring            |
| **Cross-env**             | 10.1.0  | Environment variable management   |

### Database

- **Neo4j Graph Database**: Stores entities as nodes and relationships as edges, perfect for CRM data modeling

### Development Tools

- **Visual Studio 2022** (or compatible IDE)
- **Node.js** & **npm** (for frontend development)
- **Git** (version control)
- **Swagger UI** (API testing)

---

## 📁 Project Structure

```
DoAn_Nosql/
├── backend/                          # .NET 9.0 Web API
│   ├── Controllers/                  # API Controllers (6 controllers)
│   │   ├── AnalyticsController.cs    # Analytics and reporting endpoints
│   │   ├── CampaignController.cs     # Campaign management
│   │   ├── ContractController.cs     # Contract management
│   │   ├── CustomerController.cs     # Customer CRUD operations
│   │   ├── ProductsController.cs     # Product management
│   │   └── TaskController.cs         # Task management
│   ├── Models/                       # Data models (7 models)
│   │   ├── Campaign.cs               # Campaign entity
│   │   ├── ContractInfo.cs           # Contract entity
│   │   ├── Customer.cs               # Customer entity
│   │   ├── Employee.cs               # Employee entity
│   │   ├── Product.cs                # Product entity
│   │   ├── Report.cs                 # Report/Analytics models
│   │   └── Task.cs                   # Task entity
│   ├── Services/                     # Business logic layer (6 services)
│   │   ├── AnalyticsService.cs       # Analytics business logic
│   │   ├── CampaignService.cs        # Campaign business logic
│   │   ├── ContractService.cs        # Contract business logic
│   │   ├── CustomerService.cs        # Customer business logic
│   │   ├── ProductService.cs         # Product business logic
│   │   └── TaskService.cs            # Task business logic
│   ├── Program.cs                    # Application entry point & DI configuration
│   ├── appsettings.json              # Configuration (Neo4j connection, etc.)
│   ├── appsettings.Development.json  # Development-specific settings
│   └── backend.csproj                # Project file with dependencies
│
├── frontend/
│   └── reactjs/                      # React 18 SPA
│       ├── public/                   # Static assets
│       ├── src/
│       │   ├── components/           # Reusable UI components
│       │   │   ├── Sidebar/          # Navigation sidebar
│       │   │   └── Topbar/           # Top navigation bar
│       │   ├── pages/                # Page components (6 pages)
│       │   │   ├── Campaigns/        # Campaign management UI
│       │   │   ├── Customers/        # Customer management UI
│       │   │   ├── Dashboard/        # Main dashboard
│       │   │   ├── Products/         # Product management UI
│       │   │   ├── Reports/          # Analytics & reports UI
│       │   │   └── Tasks/            # Task management UI
│       │   ├── data/                 # Mock data or constants
│       │   ├── styles/               # Global styles
│       │   ├── App.js                # Main app component with routing
│       │   ├── App.css               # App-level styles
│       │   └── index.js              # React entry point
│       ├── package.json              # Frontend dependencies
│       └── README.md                 # Create React App documentation
│
├── DoAn_Nosql.sln                    # Visual Studio solution file
├── package.json                      # Root package.json
└── package-lock.json                 # Root dependency lock file
```

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

1. **.NET 9.0 SDK** - [Download here](https://dotnet.microsoft.com/download/dotnet/9.0)
2. **Node.js** (v16 or higher) & **npm** - [Download here](https://nodejs.org/)
3. **Neo4j Database** (Community or Enterprise Edition)
   - Download from [Neo4j Download Center](https://neo4j.com/download/)
   - Or use Neo4j Desktop for easier management

### Database Setup

1. **Install and start Neo4j**:

   ```bash
   # If using Neo4j Desktop, create a new database
   # If using Neo4j Community Edition, start the service
   ```

2. **Configure Neo4j**:

   - Default HTTP endpoint: `http://localhost:7474`
   - Default Bolt endpoint: `bolt://localhost:7687`
   - Username: `neo4j`
   - Password: Set during first-time setup (default in config: `12345678`)

3. **Create the database**:

   ```cypher
   CREATE DATABASE doan;
   :use doan;
   ```

4. **Update backend configuration** (if needed):
   - Edit `backend/appsettings.json`:
   ```json
   {
     "Neo4j": {
       "Url": "http://localhost:7474",
       "Username": "neo4j",
       "Password": "your_password",
       "Database": "doan"
     }
   }
   ```

### Backend Setup

1. **Navigate to backend directory**:

   ```bash
   cd backend
   ```

2. **Restore dependencies**:

   ```bash
   dotnet restore
   ```

3. **Build the project**:

   ```bash
   dotnet build
   ```

4. **Run the backend**:

   ```bash
   dotnet run
   ```

5. **Access Swagger UI**:
   - Open browser: `https://localhost:5001` or `http://localhost:5000`
   - Swagger documentation will be available at the root URL

### Frontend Setup

1. **Navigate to frontend directory**:

   ```bash
   cd frontend/reactjs
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start development server**:

   ```bash
   npm start
   ```

4. **Access the application**:
   - Frontend will open automatically at: `http://127.0.0.1:3001`
   - The app is configured to run on port 3001 (see `package.json` scripts)

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│                 │         │                 │         │                 │
│  React Frontend │────────▶│  .NET Web API   │────────▶│  Neo4j Database │
│   (Port 3001)   │  HTTP   │  (Port 5000/1)  │  HTTP   │   (Port 7474)   │
│                 │◀────────│                 │◀────────│                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

### Backend Architecture Pattern

The backend follows a **3-tier architecture**:

1. **Controllers Layer** (`Controllers/`)

   - Handle HTTP requests/responses
   - Route mapping and request validation
   - Delegate business logic to services
   - Return appropriate HTTP status codes

2. **Service Layer** (`Services/`)

   - Implement business logic
   - Communicate with Neo4j via HTTP API
   - Execute Cypher queries
   - Transform data between API and database formats

3. **Model Layer** (`Models/`)
   - Define data structures (POCOs - Plain Old CLR Objects)
   - Represent entities and DTOs (Data Transfer Objects)

### Frontend Architecture Pattern

The frontend follows a **component-based architecture**:

1. **App Component** (`App.js`)

   - Main application container
   - Client-side routing logic (page switching)
   - State management for current page

2. **Layout Components** (`components/`)

   - `Sidebar`: Navigation menu
   - `Topbar`: Header with user info

3. **Page Components** (`pages/`)
   - Feature-specific pages
   - Each page is self-contained with its own logic and styling

### Data Flow

```
User Action (Frontend)
    ↓
React Component Event Handler
    ↓
Axios HTTP Request
    ↓
.NET Controller Endpoint
    ↓
Service Layer (Business Logic)
    ↓
Neo4j HTTP API (Cypher Query)
    ↓
Neo4j Database
    ↓
Response flows back through the same layers
```

### Neo4j Graph Model

The application uses a graph database where:

- **Nodes**: Represent entities (Customer, Product, Campaign, Task, Employee, Contract)
- **Relationships**: Represent connections between entities
  - `INTERACTED_WITH`: Customer ↔ Product/Service
  - `ASSIGNED_TO`: Task → Employee
  - `PARTICIPATES_IN`: Customer → Campaign
  - `HAS_CONTRACT`: Customer → Contract
  - `PURCHASED`: Customer → Product

Example Cypher query pattern:

```cypher
MATCH (c:Customer)-[r:INTERACTED_WITH]->(p:Product)
WHERE c.id = $customerId
RETURN c, r, p
```

---

## 💻 Development Workflow

### Making Changes

1. **Backend Changes**:

   ```bash
   # Navigate to backend
   cd backend

   # Make your changes to Controllers, Services, or Models

   # Build to check for errors
   dotnet build

   # Run the application
   dotnet run

   # Test via Swagger UI at http://localhost:5000
   ```

2. **Frontend Changes**:

   ```bash
   # Navigate to frontend
   cd frontend/reactjs

   # Make your changes to components or pages

   # The dev server will auto-reload
   # If not running, start it:
   npm start
   ```

### Adding a New Feature

#### Backend (New Entity/API)

1. **Create Model** (`Models/YourEntity.cs`):

   ```csharp
   namespace backend.Models
   {
       public class YourEntity
       {
           public string id { get; set; }
           public string name { get; set; }
           // ... other properties
       }
   }
   ```

2. **Create Service** (`Services/YourEntityService.cs`):

   ```csharp
   namespace backend.Service
   {
       public class YourEntityService
       {
           private readonly HttpClient _httpClient;
           private readonly string _url;
           // ... implement CRUD methods with Cypher queries
       }
   }
   ```

3. **Create Controller** (`Controllers/YourEntityController.cs`):

   ```csharp
   [ApiController]
   [Route("api/[controller]")]
   public class YourEntityController : ControllerBase
   {
       private readonly YourEntityService _service;
       // ... implement endpoints
   }
   ```

4. **Register Service** in `Program.cs`:
   ```csharp
   builder.Services.AddScoped<YourEntityService>();
   ```

#### Frontend (New Page)

1. **Create Page Component** (`src/pages/YourFeature/YourFeature.js`):

   ```javascript
   import React, { useState, useEffect } from "react";
   import axios from "axios";

   export default function YourFeature() {
     // ... component logic
   }
   ```

2. **Add Route** in `App.js`:

   ```javascript
   import YourFeature from './pages/YourFeature/YourFeature';

   // In renderPage():
   case 'yourfeature':
       return <YourFeature />;
   ```

3. **Add Navigation** in `Sidebar.js`:
   ```javascript
   <li onClick={() => setPage("yourfeature")}>Your Feature</li>
   ```

### Testing

#### Backend Testing

- Use **Swagger UI** for manual API testing
- Access at `http://localhost:5000` when backend is running
- Test all CRUD operations for each controller

#### Frontend Testing

```bash
cd frontend/reactjs
npm test
```

---

## 📡 API Documentation

### Base URL

- Development: `http://localhost:5000/api`
- Swagger UI: `http://localhost:5000`

### Available Endpoints

#### Customer API (`/api/customer`)

| Method | Endpoint                                 | Description                                       |
| ------ | ---------------------------------------- | ------------------------------------------------- |
| GET    | `/api/customer`                          | Get all customers                                 |
| GET    | `/api/customer/filter?segment={segment}` | Get customers by segment (VIP, Business, Regular) |
| GET    | `/api/customer/{id}`                     | Get customer by ID                                |
| POST   | `/api/customer/create`                   | Create new customer                               |
| PATCH  | `/api/customer/{id}`                     | Update customer                                   |
| DELETE | `/api/customer/{id}`                     | Delete customer                                   |
| GET    | `/api/customer/interactions/{id}`        | Get customer interactions                         |
| POST   | `/api/customer/interactions/{id}`        | Add customer interaction                          |
| GET    | `/api/customer/journey/{id}`             | Get customer journey                              |

#### Campaign API (`/api/campaign`)

- CRUD operations for marketing campaigns
- Campaign-customer relationship management

#### Task API (`/api/task`)

- Task creation and assignment
- Task status tracking
- Task-customer relationships

#### Product API (`/api/products`)

- Product catalog management
- Product-customer relationships

#### Contract API (`/api/contract`)

- Contract management
- Customer-contract relationships

#### Analytics API (`/api/analytics`)

- Customer journey analytics
- Interaction reports
- Campaign performance metrics

### Example API Call

```javascript
// Frontend example using Axios
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

// Get all customers
const fetchCustomers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/customer`);
    console.log(response.data);
  } catch (error) {
    console.error("Error fetching customers:", error);
  }
};

// Create a new customer
const createCustomer = async (customerData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/customer/create`,
      customerData
    );
    return response.data;
  } catch (error) {
    console.error("Error creating customer:", error);
  }
};
```

---

## 🔧 Common Tasks

### Updating Neo4j Connection

Edit `backend/appsettings.json`:

```json
{
  "Neo4j": {
    "Url": "http://your-neo4j-host:7474",
    "Username": "your-username",
    "Password": "your-password",
    "Database": "your-database"
  }
}
```

### Changing Frontend Port

Edit `frontend/reactjs/package.json`:

```json
{
  "scripts": {
    "start": "cross-env HOST=127.0.0.1 PORT=3001 react-scripts start"
  }
}
```

### Adding New Dependencies

**Backend**:

```bash
cd backend
dotnet add package PackageName
```

**Frontend**:

```bash
cd frontend/reactjs
npm install package-name
```

### Building for Production

**Backend**:

```bash
cd backend
dotnet publish -c Release -o ./publish
```

**Frontend**:

```bash
cd frontend/reactjs
npm run build
# Output will be in the 'build' folder
```

---

## 📚 Additional Resources

### Neo4j Resources

- [Neo4j Documentation](https://neo4j.com/docs/)
- [Cypher Query Language](https://neo4j.com/developer/cypher/)
- [Neo4j .NET Driver](https://neo4j.com/docs/dotnet-manual/current/)

### .NET Resources

- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core/)
- [.NET 9.0 Documentation](https://docs.microsoft.com/dotnet/)

### React Resources

- [React Documentation](https://react.dev/)
- [Create React App](https://create-react-app.dev/)
- [Axios Documentation](https://axios-http.com/)

---

## 🤝 Getting Help

If you encounter issues:

1. **Check the logs**:

   - Backend: Console output when running `dotnet run`
   - Frontend: Browser console (F12)
   - Neo4j: Neo4j logs in the database directory

2. **Common Issues**:

   - **Port conflicts**: Ensure ports 3001, 5000/5001, and 7474 are available
   - **Neo4j connection**: Verify Neo4j is running and credentials are correct
   - **CORS errors**: Backend is configured to allow all origins in development

3. **Review existing code**: Look at similar implementations in Controllers/Services/Pages

---

## 📝 Code Style Guidelines

### Backend (C#)

- Follow standard C# naming conventions (PascalCase for classes/methods, camelCase for variables)
- Use async/await for all I/O operations
- Add XML comments for public APIs
- Keep controllers thin - business logic belongs in services

### Frontend (JavaScript/React)

- Use functional components with hooks
- Follow React best practices
- Use meaningful variable and function names
- Keep components focused and reusable
- Use CSS modules or styled-components for styling

---

**Happy Coding! 🚀**

For questions or contributions, please reach out to the development team.
