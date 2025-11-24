// src/data/mockData.js

// USERS
export const mockUsers = [
  {
    id: "U001",
    username: "admin",
    email: "admin@company.com",
    password: "123",
    status: "Active",
    createdAt: "2025-11-19T00:00:00Z",
    role: "Admin",
    employee: {
      id: "E001",
      name: "Nguyễn Văn Admin",
      position: "Quản trị hệ thống",
      department: "IT",
      email: "admin@company.com",
      phone: "0901111111",
      status: "Active",
      hireDate: "2020-01-01",
      performanceScore: 4.9,
    },
  },
  {
    id: "U002",
    username: "user1",
    email: "user1@company.com",
    password: "123",
    status: "Active",
    createdAt: "2025-11-19T00:00:00Z",
    role: "User",
    employee: {
      id: "E002",
      name: "Trần Văn User",
      position: "Chuyên viên CSKH",
      department: "CSKH",
      email: "user1@company.com",
      phone: "0902222222",
      status: "Active",
      hireDate: "2022-06-20",
      performanceScore: 4.5,
    },
  },
];

// CUSTOMERS
export const mockCustomers = [
  {
    id: "C001",
    name: "Nguyễn Văn An",
    phone: "0912345678",
    email: "an.nguyen@email.com",
    type: "Cá nhân",
    address: "123 Nguyễn Huệ, Q1, TP.HCM",
    status: "Active",
    segment: "VIP",
    createdDate: "2025-11-01T00:00:00Z",
    lifetimeValue: 85000000,
    lastContact: "2025-11-15T00:00:00Z",
    satisfactionScore: 4.8,
  },
  {
    id: "C002",
    name: "Trần Thị Bình",
    phone: "0923456789",
    email: "binh.tran@email.com",
    type: "Doanh nghiệp",
    address: "456 Lê Lợi, Q3, TP.HCM",
    status: "Active",
    segment: "Doanh nghiệp",
    company: "Công ty ABC",
    createdDate: "2025-11-01T00:00:00Z",
    lifetimeValue: 150000000,
    lastContact: "2025-11-10T00:00:00Z",
    satisfactionScore: 4.5,
  },
];

// PRODUCTS
export const mockProducts = [
  {
    id: "P001",
    name: "Bảo hiểm sức khỏe cao cấp",
    category: "Bảo hiểm",
    price: 8000000,
    duration: 12,
    description: "Bảo hiểm chăm sóc sức khỏe toàn diện",
    status: "Active",
    commissionRate: 0.15,
    image:
      "https://images.unsplash.com/photo-1581093588401-07f3948fa2ef?crop=entropy&cs=tinysrgb&fit=crop&h=180&w=300",
  },
  {
    id: "P002",
    name: "Gói đầu tư tài chính",
    category: "Đầu tư",
    price: 15000000,
    duration: 24,
    description: "Quỹ đầu tư sinh lời ổn định",
    status: "Active",
    commissionRate: 0.2,
    image:
      "https://images.unsplash.com/photo-1573164713347-dfbd1dcb0f79?crop=entropy&cs=tinysrgb&fit=crop&h=180&w=300",
  },
];

// TASKS
export const mockTasks = [
  {
    id: "TASK001",
    title: "Follow up khách hàng VIP",
    description: "Gọi điện tư vấn thêm về gói đầu tư",
    priority: "High",
    status: "Pending",
    type: "Call",
    dueDate: "2025-11-22T00:00:00Z",
    createdDate: "2025-11-19T00:00:00Z",
    assignedTo: "user1",
    relatedCustomer: "C001",
  },
  {
    id: "TASK002",
    title: "Xử lý khiếu nại khách hàng",
    description: "Khách hàng phàn nàn về thời gian xử lý",
    priority: "High",
    status: "In Progress",
    type: "Support",
    dueDate: "2025-11-20T00:00:00Z",
    createdDate: "2025-11-19T00:00:00Z",
    assignedTo: "user1",
    relatedCustomer: "C002",
  },
];

// RELATIONSHIPS (optional, nếu cần mock quan hệ)
export const mockAssignments = [
  { employeeId: "E002", customerId: "C001" },
  { employeeId: "E002", customerId: "C002" },
];

export const mockCampaigns = [
  {
    id: "C001",
    name: "Chiến dịch Tết 2024",
    target: "VIP",
    budget: 50000000,
    spent: 35000000,
    status: "Active",
    type: "Email Marketing",
    startDate: "2024-01-01",
    endDate: "2024-02-15",
    leads: 450,
    conversions: 89,
  },
  {
    id: "C002",
    name: "Khuyến mãi Hè",
    target: "Thường",
    budget: 80000000,
    spent: 0,
    status: "Paused",
    type: "Social Media",
    startDate: "2024-06-01",
    endDate: "2024-08-31",
    leads: 0,
    conversions: 0,
  },
  {
    id: "C003",
    name: "Chương trình Doanh nghiệp",
    target: "Doanh nghiệp",
    budget: 120000000,
    spent: 45000000,
    status: "Active",
    type: "Event",
    startDate: "2024-01-10",
    endDate: "2024-03-31",
    leads: 180,
    conversions: 42,
  },
  {
    id: "C004",
    name: "Giới thiệu sản phẩm mới",
    target: "VIP",
    budget: 40000000,
    spent: 38000000,
    status: "Completed",
    type: "Email Marketing",
    startDate: "2023-11-01",
    endDate: "2023-12-31",
    leads: 320,
    conversions: 65,
  },
];

export const mockReports = [
  {
    id: 1,
    employeeName: "Nguyễn Văn A",
    department: "Kinh doanh",
    contract: "Hợp đồng A001",
    revenue: 120000000, // 120 triệu
    customer: 25,
    kpi: 100,
    evaluation: "Xuất sắc",
  },
  {
    id: 2,
    employeeName: "Trần Thị B",
    department: "Marketing",
    contract: "Hợp đồng M023",
    revenue: 90000000, // 90 triệu
    customer: 18,
    kpi: 92,
    evaluation: "Tốt",
  },
  {
    id: 3,
    employeeName: "Lê Văn C",
    department: "Hỗ trợ khách hàng",
    contract: "Hợp đồng H045",
    revenue: 75000000,
    customer: 12,
    kpi: 78,
    evaluation: "Trung bình",
  },
  {
    id: 4,
    employeeName: "Phạm Thị D",
    department: "Sales",
    contract: "Hợp đồng S067",
    revenue: 65000000,
    customer: 10,
    kpi: 65,
    evaluation: "Yếu",
  },
  {
    id: 5,
    employeeName: "Ngô Văn E",
    department: "Marketing",
    contract: "Hợp đồng M089",
    revenue: 55000000,
    customer: 8,
    kpi: 55,
    evaluation: "Kém",
  },
];
