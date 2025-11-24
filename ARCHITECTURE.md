# 🏗️ DoAn_Nosql - Architecture Documentation

## System Overview

This document provides a detailed technical architecture overview of the DoAn_Nosql CRM system.

## High-Level Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        UI[React SPA<br/>Port 3001]
        Components[Reusable Components<br/>Sidebar, Topbar]
        Pages[Feature Pages<br/>Dashboard, Customers, etc.]
    end

    subgraph "Backend Layer"
        API[ASP.NET Core Web API<br/>Port 5000/5001]
        Controllers[Controllers Layer<br/>6 Controllers]
        Services[Service Layer<br/>6 Services]
        Models[Models Layer<br/>7 Entities]
    end

    subgraph "Data Layer"
        Neo4j[Neo4j Graph Database<br/>Port 7474/7687]
        Nodes[(Nodes:<br/>Customer, Product,<br/>Campaign, Task, etc.)]
        Relationships[(Relationships:<br/>INTERACTED_WITH,<br/>ASSIGNED_TO, etc.)]
    end

    UI --> Components
    UI --> Pages
    Pages -->|HTTP/Axios| API
    API --> Controllers
    Controllers --> Services
    Services --> Models
    Services -->|Cypher Queries<br/>HTTP API| Neo4j
    Neo4j --> Nodes
    Neo4j --> Relationships

    style UI fill:#61dafb,stroke:#333,stroke-width:2px
    style API fill:#512bd4,stroke:#333,stroke-width:2px
    style Neo4j fill:#008cc1,stroke:#333,stroke-width:2px
```

## Component Architecture

### Frontend Architecture

```mermaid
graph LR
    subgraph "React Application"
        App[App.js<br/>Main Container]
        Router[Client-Side Router<br/>Page State Management]

        subgraph "Layout Components"
            Sidebar[Sidebar Component]
            Topbar[Topbar Component]
        end

        subgraph "Feature Pages"
            Dashboard[Dashboard Page]
            Customers[Customers Page]
            Products[Products Page]
            Tasks[Tasks Page]
            Campaigns[Campaigns Page]
            Reports[Reports Page]
        end

        API_Client[Axios HTTP Client]
    end

    App --> Router
    Router --> Sidebar
    Router --> Topbar
    Router --> Dashboard
    Router --> Customers
    Router --> Products
    Router --> Tasks
    Router --> Campaigns
    Router --> Reports

    Dashboard --> API_Client
    Customers --> API_Client
    Products --> API_Client
    Tasks --> API_Client
    Campaigns --> API_Client
    Reports --> API_Client

    API_Client -->|REST API Calls| Backend[Backend API]

    style App fill:#61dafb
    style API_Client fill:#5a29e4
```

### Backend Architecture

```mermaid
graph TB
    subgraph "ASP.NET Core Web API"
        Entry[Program.cs<br/>Entry Point & DI]
        Middleware[Middleware Pipeline<br/>CORS, Auth, Swagger]

        subgraph "Controllers"
            CustomerCtrl[CustomerController]
            CampaignCtrl[CampaignController]
            TaskCtrl[TaskController]
            ProductCtrl[ProductsController]
            ContractCtrl[ContractController]
            AnalyticsCtrl[AnalyticsController]
        end

        subgraph "Services"
            CustomerSvc[CustomerService]
            CampaignSvc[CampaignService]
            TaskSvc[TaskService]
            ProductSvc[ProductService]
            ContractSvc[ContractService]
            AnalyticsSvc[AnalyticsService]
        end

        subgraph "Models"
            CustomerModel[Customer Model]
            CampaignModel[Campaign Model]
            TaskModel[Task Model]
            ProductModel[Product Model]
            ContractModel[ContractInfo Model]
            EmployeeModel[Employee Model]
            ReportModel[Report Model]
        end

        HTTP[HTTP Client<br/>Neo4j Communication]
    end

    Entry --> Middleware
    Middleware --> CustomerCtrl
    Middleware --> CampaignCtrl
    Middleware --> TaskCtrl
    Middleware --> ProductCtrl
    Middleware --> ContractCtrl
    Middleware --> AnalyticsCtrl

    CustomerCtrl --> CustomerSvc
    CampaignCtrl --> CampaignSvc
    TaskCtrl --> TaskSvc
    ProductCtrl --> ProductSvc
    ContractCtrl --> ContractSvc
    AnalyticsCtrl --> AnalyticsSvc

    CustomerSvc --> CustomerModel
    CampaignSvc --> CampaignModel
    TaskSvc --> TaskModel
    ProductSvc --> ProductModel
    ContractSvc --> ContractModel
    AnalyticsSvc --> ReportModel

    CustomerSvc --> HTTP
    CampaignSvc --> HTTP
    TaskSvc --> HTTP
    ProductSvc --> HTTP
    ContractSvc --> HTTP
    AnalyticsSvc --> HTTP

    HTTP -->|Cypher Queries| DB[(Neo4j Database)]

    style Entry fill:#512bd4
    style HTTP fill:#ff6b6b
    style DB fill:#008cc1
```

## Data Model (Neo4j Graph)

```mermaid
graph LR
    subgraph "Nodes"
        Customer([Customer<br/>id, name, email,<br/>segment, phone])
        Product([Product<br/>id, name,<br/>category, price])
        Campaign([Campaign<br/>id, name, status,<br/>startDate, endDate])
        Task([Task<br/>id, title, status,<br/>priority, dueDate])
        Employee([Employee<br/>id, name,<br/>department, role])
        Contract([Contract<br/>id, terms,<br/>startDate, endDate])
    end

    Customer -->|PURCHASED| Product
    Customer -->|INTERACTED_WITH| Product
    Customer -->|PARTICIPATES_IN| Campaign
    Customer -->|HAS_CONTRACT| Contract
    Task -->|ASSIGNED_TO| Employee
    Task -->|RELATED_TO| Customer
    Campaign -->|TARGETS| Customer
    Employee -->|MANAGES| Customer

    style Customer fill:#4ecdc4
    style Product fill:#ff6b6b
    style Campaign fill:#ffe66d
    style Task fill:#a8e6cf
    style Employee fill:#ffd3b6
    style Contract fill:#ffaaa5
```

## Request Flow

### Typical API Request Flow

```mermaid
sequenceDiagram
    participant User
    participant React as React Component
    participant Axios
    participant Controller
    participant Service
    participant Neo4j as Neo4j Database

    User->>React: Click "Get Customers"
    React->>Axios: axios.get('/api/customer')
    Axios->>Controller: HTTP GET /api/customer
    Controller->>Service: GetAllCustomersAsync()
    Service->>Service: Build Cypher Query
    Service->>Neo4j: POST /db/doan/tx/commit<br/>{query: "MATCH (c:Customer) RETURN c"}
    Neo4j-->>Service: JSON Response with nodes
    Service-->>Service: Parse & Transform Data
    Service-->>Controller: List<Customer>
    Controller-->>Axios: HTTP 200 OK + JSON
    Axios-->>React: Response Data
    React-->>User: Display Customers
```

### Customer Journey Query Example

```mermaid
sequenceDiagram
    participant Client as Frontend
    participant API as CustomerController
    participant Svc as CustomerService
    participant DB as Neo4j

    Client->>API: GET /api/customer/journey/{id}
    API->>Svc: GetCustomerJourneyAsync(id)
    Svc->>DB: MATCH (c:Customer {id: $id})<br/>-[r]-(related)<br/>RETURN c, r, related
    DB-->>Svc: Graph data (nodes + relationships)
    Svc->>Svc: Transform to Journey object
    Svc-->>API: CustomerJourney
    API-->>Client: 200 OK + Journey JSON
```

## Technology Stack Details

### Backend Stack

| Layer               | Technology             | Purpose                                |
| ------------------- | ---------------------- | -------------------------------------- |
| **Framework**       | .NET 9.0               | Modern, high-performance web framework |
| **API**             | ASP.NET Core Web API   | RESTful API development                |
| **Database Driver** | Neo4j.Driver 5.28.3    | Official .NET driver for Neo4j         |
| **Serialization**   | Newtonsoft.Json 13.0.4 | JSON handling                          |
| **Documentation**   | Swagger/OpenAPI 9.0.6  | Interactive API documentation          |
| **DI Container**    | Built-in .NET DI       | Dependency injection                   |
| **HTTP Client**     | HttpClient             | Communication with Neo4j HTTP API      |

### Frontend Stack

| Layer                | Technology             | Purpose                      |
| -------------------- | ---------------------- | ---------------------------- |
| **Framework**        | React 18.3.1           | Component-based UI framework |
| **Build Tool**       | Create React App 5.0.1 | Zero-config build setup      |
| **HTTP Client**      | Axios 1.13.2           | Promise-based HTTP client    |
| **Testing**          | React Testing Library  | Component testing            |
| **State Management** | React Hooks (useState) | Local component state        |
| **Routing**          | Custom (state-based)   | Client-side page switching   |

### Database

| Component          | Technology               | Purpose                          |
| ------------------ | ------------------------ | -------------------------------- |
| **Database**       | Neo4j Graph Database     | Store entities and relationships |
| **Query Language** | Cypher                   | Graph query language             |
| **API Protocol**   | HTTP REST API            | Database communication           |
| **Ports**          | 7474 (HTTP), 7687 (Bolt) | Database access                  |

## Design Patterns

### Backend Patterns

1. **Repository Pattern** (via Services)

   - Services act as repositories
   - Encapsulate data access logic
   - Abstract Neo4j communication

2. **Dependency Injection**

   - Services injected into controllers
   - Configuration injected into services
   - Promotes loose coupling

3. **DTO Pattern**

   - Models serve as DTOs
   - Separate database representation from API contracts

4. **Async/Await Pattern**
   - All I/O operations are asynchronous
   - Improves scalability

### Frontend Patterns

1. **Component-Based Architecture**

   - Reusable UI components
   - Separation of concerns

2. **Container/Presentational Pattern**

   - Pages as containers (logic)
   - Components as presentational (UI)

3. **Hooks Pattern**
   - useState for state management
   - useEffect for side effects

## Security Considerations

> [!WARNING]
> The current implementation has several security considerations for production deployment:

1. **Database Credentials**: Stored in `appsettings.json` - should use environment variables or Azure Key Vault
2. **CORS**: Currently allows all origins (`AllowedHosts: "*"`) - should be restricted in production
3. **Authentication**: No authentication implemented - should add JWT or OAuth
4. **Authorization**: No role-based access control - should implement authorization policies
5. **HTTPS**: Should enforce HTTPS in production
6. **Input Validation**: Should add comprehensive input validation and sanitization

## Performance Considerations

1. **Database Indexing**: Ensure Neo4j indexes on frequently queried properties (e.g., `Customer.id`)
2. **Query Optimization**: Use LIMIT clauses in Cypher queries for large datasets
3. **Caching**: Consider implementing caching for frequently accessed data
4. **Connection Pooling**: HttpClient is reused (singleton pattern in services)
5. **Async Operations**: All database operations are asynchronous

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]

        subgraph "Frontend Tier"
            FE1[React App<br/>Static Files]
            FE2[React App<br/>Static Files]
        end

        subgraph "Backend Tier"
            BE1[.NET API<br/>Instance 1]
            BE2[.NET API<br/>Instance 2]
        end

        subgraph "Database Tier"
            Neo4jCluster[Neo4j Cluster<br/>or Single Instance]
        end
    end

    Users[Users] --> LB
    LB --> FE1
    LB --> FE2
    FE1 --> BE1
    FE1 --> BE2
    FE2 --> BE1
    FE2 --> BE2
    BE1 --> Neo4jCluster
    BE2 --> Neo4jCluster

    style Users fill:#95e1d3
    style LB fill:#f38181
    style FE1 fill:#61dafb
    style FE2 fill:#61dafb
    style BE1 fill:#512bd4
    style BE2 fill:#512bd4
    style Neo4jCluster fill:#008cc1
```

## Development vs Production

| Aspect       | Development              | Production                                         |
| ------------ | ------------------------ | -------------------------------------------------- |
| **Frontend** | Dev server (port 3001)   | Static files served by web server                  |
| **Backend**  | Kestrel (port 5000/5001) | IIS, Nginx, or cloud hosting                       |
| **Database** | Local Neo4j instance     | Managed Neo4j (AuraDB) or self-hosted cluster      |
| **CORS**     | Allow all origins        | Specific origins only                              |
| **Logging**  | Console output           | Structured logging (Serilog, Application Insights) |
| **Secrets**  | appsettings.json         | Environment variables, Key Vault                   |

## Monitoring & Observability

Recommended additions for production:

1. **Application Performance Monitoring (APM)**

   - Application Insights
   - New Relic
   - Datadog

2. **Logging**

   - Serilog for structured logging
   - ELK Stack (Elasticsearch, Logstash, Kibana)

3. **Metrics**

   - Response times
   - Error rates
   - Database query performance

4. **Health Checks**
   - API health endpoint
   - Database connectivity check

## Scalability Considerations

1. **Horizontal Scaling**: Backend API can be scaled horizontally (multiple instances)
2. **Database Scaling**: Neo4j supports clustering for high availability
3. **Caching Layer**: Add Redis for session management and caching
4. **CDN**: Serve frontend static assets via CDN
5. **API Gateway**: Consider adding API Gateway for rate limiting and request routing

---

**Last Updated**: 2025-11-24  
**Version**: 1.0  
**Maintained By**: Development Team
