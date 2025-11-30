// Clear database
MATCH (n) DETACH DELETE n;

// =========================================================
// 1. ROLES
// =========================================================
CREATE (r1:Role {id: "ROLE01", name: "Admin"});
CREATE (r2:Role {id: "ROLE02", name: "Manager"});
CREATE (r3:Role {id: "ROLE03", name: "Employee"});

// =========================================================
// 2. USERS
// =========================================================
CREATE (u1:User {id: "U999", username: "Admin User", email: "admin@crm.vn", password: "123456", roleId: "ROLE01", status: "Active", createdat: datetime("2023-01-01T00:00:00Z")});
CREATE (u2:User {id: "U002", username: "Nguyen Van Hung", email: "hung.nguyen@crm.vn", password: "123456", roleId: "ROLE02", status: "Active", createdat: datetime("2023-02-15T09:00:00Z")});
CREATE (u3:User {id: "U003", username: "Le Thi Mai", email: "mai.le@crm.vn", password: "123456", roleId: "ROLE03", status: "Active", createdat: datetime("2023-03-10T08:30:00Z")});
CREATE (u4:User {id: "U004", username: "Tran Van Giam", email: "giam.tran@crm.vn", password: "123456", roleId: "ROLE03", status: "Active", createdat: datetime("2023-04-05T08:00:00Z")});
CREATE (u5:User {id: "U005", username: "Pham Minh Tuan", email: "tuan.pham@crm.vn", password: "123456", roleId: "ROLE03", status: "Active", createdat: datetime("2023-05-20T08:00:00Z")});

// Link Users to Roles
MATCH (u:User {id: "U999"}), (r:Role {id: "ROLE01"}) MERGE (u)-[:HAS_ROLE]->(r);
MATCH (u:User {id: "U002"}), (r:Role {id: "ROLE02"}) MERGE (u)-[:HAS_ROLE]->(r);
MATCH (u:User {id: "U003"}), (r:Role {id: "ROLE03"}) MERGE (u)-[:HAS_ROLE]->(r);
MATCH (u:User {id: "U004"}), (r:Role {id: "ROLE03"}) MERGE (u)-[:HAS_ROLE]->(r);
MATCH (u:User {id: "U005"}), (r:Role {id: "ROLE03"}) MERGE (u)-[:HAS_ROLE]->(r);

// Link Users to Employees (by Email)
MATCH (u:User), (e:Employee)
WHERE u.email = e.email
MERGE (u)-[:IS_EMPLOYEE]->(e);

// =========================================================
// 3. EMPLOYEES
// =========================================================
CREATE (e1:Employee {id: "E0001", name: "Trần Văn Giám", phone: "0909000111", email: "giam.tran@crm.vn", position: "Nhân viên", department: "Marketing", performanceScore: 9.8, hiredate: datetime("2019-12-31T17:00:00Z"), status: "Active"});
CREATE (e2:Employee {id: "E0002", name: "Nguyễn Văn Hùng", phone: "0909000222", email: "hung.nguyen@crm.vn", position: "Trưởng phòng", department: "Sales", performanceScore: 9.5, hiredate: datetime("2020-05-15T08:00:00Z"), status: "Active"});
CREATE (e3:Employee {id: "E0003", name: "Lê Thị Mai", phone: "0909000333", email: "mai.le@crm.vn", position: "Nhân viên", department: "Customer Support", performanceScore: 9.2, hiredate: datetime("2021-08-20T08:00:00Z"), status: "Active"});
CREATE (e4:Employee {id: "E0004", name: "Phạm Minh Tuấn", phone: "0909000444", email: "tuan.pham@crm.vn", position: "Nhân viên", department: "Sales", performanceScore: 8.5, hiredate: datetime("2022-01-10T08:00:00Z"), status: "Active"});

// =========================================================
// 4. PRODUCTS
// =========================================================
// Bảo hiểm
CREATE (p1:Product {id: "P001", name: "Bảo hiểm Nhân thọ An Tâm", category: "Bảo hiểm", price: 20000000, duration: 120, description: "Bảo vệ trọn đời, tích lũy an toàn.", status: "Active", commissionRate: 0.15});
CREATE (p2:Product {id: "P002", name: "Bảo hiểm Sức khỏe Gold", category: "Bảo hiểm", price: 5000000, duration: 12, description: "Chi trả viện phí nội trú quốc tế.", status: "Active", commissionRate: 0.2});
CREATE (p3:Product {id: "P003", name: "Bảo hiểm Ô tô Toàn diện", category: "Bảo hiểm", price: 12000000, duration: 12, description: "Bảo hiểm vật chất và trách nhiệm dân sự.", status: "Active", commissionRate: 0.1});

// Đầu tư
CREATE (p4:Product {id: "P004", name: "Gói Đầu tư Thịnh Vượng", category: "Đầu tư", price: 50000000, duration: 36, description: "Lãi suất kỳ vọng 12%/năm, rủi ro trung bình.", status: "Active", commissionRate: 0.1});
CREATE (p5:Product {id: "P005", name: "Trái phiếu Doanh nghiệp", category: "Đầu tư", price: 100000000, duration: 24, description: "Lãi suất cố định 9.5%/năm.", status: "Active", commissionRate: 0.08});
CREATE (p6:Product {id: "P006", name: "Quỹ Mở Cân Bằng", category: "Đầu tư", price: 10000000, duration: 0, description: "Đầu tư linh hoạt, thanh khoản cao.", status: "Active", commissionRate: 0.05});

// Tư vấn
CREATE (p7:Product {id: "P007", name: "Tư vấn Tài chính Doanh nghiệp", category: "Tư vấn", price: 100000000, duration: 6, description: "Tái cấu trúc dòng tiền cho SME.", status: "Active", commissionRate: 0.05});
CREATE (p8:Product {id: "P008", name: "Tư vấn Thuế Cá nhân", category: "Tư vấn", price: 5000000, duration: 1, description: "Quyết toán thuế TNCN.", status: "Active", commissionRate: 0.1});

// =========================================================
// 5. CUSTOMERS
// =========================================================
// VIP
CREATE (c1:Customer {id: "C000001", name: "Hồ Đức Hoàng Quân", phone: "0931318657", email: "quanho@gmail.com", type: "Cá nhân", address: "10 Đan Phượng, Hà Nội", status: "Active", segment: "VIP", createddate: datetime("2023-01-15T09:00:00Z"), lifetimevalue: 500000000, lastcontact: datetime("2024-11-28T10:00:00Z"), satisfactionScore: 9.5});
CREATE (c2:Customer {id: "C000002", name: "Phạm Nhật Minh", phone: "0912345678", email: "minh.pham@gmail.com", type: "Cá nhân", address: "Landmark 81, Bình Thạnh, TP.HCM", status: "Active", segment: "VIP", createddate: datetime("2023-02-20T14:00:00Z"), lifetimevalue: 350000000, lastcontact: datetime("2024-11-25T15:00:00Z"), satisfactionScore: 9.0});
CREATE (c3:Customer {id: "C000003", name: "Công ty Xây Dựng Hòa Bình", phone: "02899998888", email: "info@hoabinh.vn", type: "Doanh nghiệp", address: "Quận 3, TP.HCM", status: "Active", segment: "VIP", createddate: datetime("2022-06-10T08:00:00Z"), lifetimevalue: 2000000000, lastcontact: datetime("2024-11-29T09:00:00Z"), satisfactionScore: 8.8});

// Doanh nghiệp
CREATE (c4:Customer {id: "C000004", name: "Công ty Tech Solutions", phone: "02838999888", email: "contact@techsol.vn", type: "Doanh nghiệp", address: "Khu Công Nghệ Cao, Q9, TP.HCM", status: "Active", segment: "Doanh nghiệp", createddate: datetime("2023-08-15T10:00:00Z"), lifetimevalue: 120000000, lastcontact: datetime("2024-11-20T11:00:00Z"), satisfactionScore: 8.5});
CREATE (c5:Customer {id: "C000005", name: "Công ty Logistics Á Châu", phone: "02877776666", email: "support@achau.logistics", type: "Doanh nghiệp", address: "Quận 7, TP.HCM", status: "Active", segment: "Doanh nghiệp", createddate: datetime("2023-11-01T09:00:00Z"), lifetimevalue: 80000000, lastcontact: datetime("2024-11-15T14:00:00Z"), satisfactionScore: 8.0});

// Thường
CREATE (c6:Customer {id: "C000006", name: "Vũ Thị Hoa", phone: "0933444555", email: "hoa.vu@yahoo.com", type: "Cá nhân", address: "123 Lê Lợi, Q1, TP.HCM", status: "Potential", segment: "Thường", createddate: datetime("2024-02-14T17:00:00Z"), lifetimevalue: 0, lastcontact: datetime("2024-11-10T16:00:00Z"), satisfactionScore: 0});
CREATE (c7:Customer {id: "C000007", name: "Hoàng Văn Nam", phone: "0988777666", email: "nam.hoang@outlook.com", type: "Cá nhân", address: "Đà Nẵng", status: "Inactive", segment: "Thường", createddate: datetime("2022-11-10T17:00:00Z"), lifetimevalue: 15000000, lastcontact: datetime("2023-11-30T17:00:00Z"), satisfactionScore: 4});
CREATE (c8:Customer {id: "C000008", name: "Nguyễn Văn An", phone: "0911222333", email: "an.nguyen@gmail.com", type: "Cá nhân", address: "Thủ Đức, TP.HCM", status: "Active", segment: "Thường", createddate: datetime("2024-08-15T14:00:00Z"), lifetimevalue: 20000000, lastcontact: datetime("2024-11-25T09:30:00Z"), satisfactionScore: 7.5});
CREATE (c9:Customer {id: "C000009", name: "Trần Thị Bích", phone: "0944555666", email: "bich.tran@yahoo.com", type: "Cá nhân", address: "Gò Vấp, TP.HCM", status: "Potential", segment: "Thường", createddate: datetime("2024-11-01T10:00:00Z"), lifetimevalue: 0, lastcontact: datetime("2024-11-29T15:00:00Z"), satisfactionScore: 0});
CREATE (c10:Customer {id: "C000010", name: "Lê Văn Cường", phone: "0977888999", email: "cuong.le@gmail.com", type: "Cá nhân", address: "Biên Hòa, Đồng Nai", status: "Active", segment: "Thường", createddate: datetime("2024-05-20T08:00:00Z"), lifetimevalue: 5000000, lastcontact: datetime("2024-11-22T10:00:00Z"), satisfactionScore: 7.0});

// =========================================================
// 6. CAMPAIGNS
// =========================================================
CREATE (cam1:Campaign {id: "CAM001", name: "Tri ân Khách hàng VIP 2024", type: "Sự kiện", startDate: date("2024-11-30"), endDate: date("2024-12-30"), budget: 500000000, status: "Active", description: "Tiệc tối tri ân khách hàng VIP tại Gem Center.", criteria: "Khách hàng VIP", leads: 100, conversions: 10, actualRevenue: 1000000, spent: 50000000});
CREATE (cam2:Campaign {id: "CAM002", name: "Mở thẻ tín dụng Q4", type: "Email Marketing", startDate: date("2024-10-01"), endDate: date("2024-12-31"), budget: 200000000, status: "Active", description: "Chiến dịch đẩy mạnh mở thẻ tín dụng cuối năm.", criteria: "Khách hàng cá nhân thu nhập > 15tr", leads: 500, conversions: 50, actualRevenue: 50000000, spent: 120000000});
CREATE (cam3:Campaign {id: "CAM003", name: "Bảo hiểm Sức khỏe cho Gia đình", type: "Quảng cáo", startDate: date("2024-06-01"), endDate: date("2024-09-30"), budget: 300000000, status: "Completed", description: "Chạy quảng cáo FB/Google Ads.", criteria: "Gia đình trẻ", leads: 1000, conversions: 150, actualRevenue: 750000000, spent: 280000000});

// Target Customers
MATCH (cam:Campaign {id: "CAM001"}), (c:Customer {segment: "VIP"}) MERGE (cam)-[:TARGETS]->(c);
MATCH (cam:Campaign {id: "CAM002"}), (c:Customer {segment: "Thường"}) MERGE (cam)-[:TARGETS]->(c);
MATCH (cam:Campaign {id: "CAM003"}), (c:Customer {type: "Cá nhân"}) MERGE (cam)-[:TARGETS]->(c);

// =========================================================
// 7. CONTRACTS (OWNS relationship)
// =========================================================
// C1 owns P1, P4
MATCH (c:Customer {id: "C000001"}), (p:Product {id: "P001"}) CREATE (c)-[:OWNS {id: "CT000001", purchaseDate: date("2023-02-01"), expiryDate: date("2033-02-01"), status: "Active", contractValue: 20000000, commission: 3000000, commissionRate: 0.15}]->(p);
MATCH (c:Customer {id: "C000001"}), (p:Product {id: "P004"}) CREATE (c)-[:OWNS {id: "CT000002", purchaseDate: date("2023-03-15"), expiryDate: date("2026-03-15"), status: "Active", contractValue: 50000000, commission: 5000000, commissionRate: 0.1}]->(p);

// C2 owns P2, P5
MATCH (c:Customer {id: "C000002"}), (p:Product {id: "P002"}) CREATE (c)-[:OWNS {id: "CT000003", purchaseDate: date("2023-04-10"), expiryDate: date("2024-04-10"), status: "Active", contractValue: 5000000, commission: 1000000, commissionRate: 0.2}]->(p);
MATCH (c:Customer {id: "C000002"}), (p:Product {id: "P005"}) CREATE (c)-[:OWNS {id: "CT000004", purchaseDate: date("2023-05-20"), expiryDate: date("2025-05-20"), status: "Active", contractValue: 100000000, commission: 8000000, commissionRate: 0.08}]->(p);

// C3 owns P7
MATCH (c:Customer {id: "C000003"}), (p:Product {id: "P007"}) CREATE (c)-[:OWNS {id: "CT000005", purchaseDate: date("2022-07-01"), expiryDate: date("2023-01-01"), status: "Expired", contractValue: 100000000, commission: 5000000, commissionRate: 0.05}]->(p);

// C4 owns P3
MATCH (c:Customer {id: "C000004"}), (p:Product {id: "P003"}) CREATE (c)-[:OWNS {id: "CT000006", purchaseDate: date("2023-09-01"), expiryDate: date("2024-09-01"), status: "Active", contractValue: 12000000, commission: 1200000, commissionRate: 0.1}]->(p);

// C8 owns P2
MATCH (c:Customer {id: "C000008"}), (p:Product {id: "P002"}) CREATE (c)-[:OWNS {id: "CT000007", purchaseDate: date("2024-08-20"), expiryDate: date("2025-08-20"), status: "Active", contractValue: 5000000, commission: 1000000, commissionRate: 0.2}]->(p);

// C10 owns P6
MATCH (c:Customer {id: "C000010"}), (p:Product {id: "P006"}) CREATE (c)-[:OWNS {id: "CT000008", purchaseDate: date("2024-06-01"), expiryDate: date("2025-06-01"), status: "Pending", contractValue: 10000000, commission: 500000, commissionRate: 0.05}]->(p);

// =========================================================
// 8. TASKS
// =========================================================
// E1 (Marketing) Tasks
CREATE (t1:Task {id: "T000001", title: "Gửi quà sinh nhật VIP", description: "Chuẩn bị set quà trị giá 2tr cho anh Quân", priority: "Medium", status: "Pending", type: "Chăm sóc khách hàng", dueDate: datetime("2024-12-14T17:00:00Z"), createddate: datetime("2024-11-26T17:00:00Z"), assignedToId: "E0001", relatedCustomerId: "C000001", relatedContractId: "", relatedProjectId: ""});
CREATE (t2:Task {id: "T000002", title: "Lên kế hoạch Event cuối năm", description: "Dự trù kinh phí và địa điểm", priority: "High", status: "In Progress", type: "Báo cáo", dueDate: datetime("2024-12-05T17:00:00Z"), createddate: datetime("2024-11-20T17:00:00Z"), assignedToId: "E0001", relatedCustomerId: "", relatedContractId: "", relatedProjectId: ""});

// E2 (Sales Manager) Tasks
CREATE (t3:Task {id: "T000003", title: "Duyệt hợp đồng C000010", description: "Kiểm tra hồ sơ vay vốn", priority: "High", status: "Pending", type: "Tư vấn", dueDate: datetime("2024-11-30T17:00:00Z"), createddate: datetime("2024-11-28T17:00:00Z"), assignedToId: "E0002", relatedCustomerId: "C000010", relatedContractId: "CT000008", relatedProjectId: ""});
CREATE (t4:Task {id: "T000004", title: "Họp team Sales Q4", description: "Review KPI tháng 11", priority: "Medium", status: "Completed", type: "Họp", dueDate: datetime("2024-11-25T10:00:00Z"), createddate: datetime("2024-11-20T17:00:00Z"), assignedToId: "E0002", relatedCustomerId: "", relatedContractId: "", relatedProjectId: ""});

// E3 (Support) Tasks
CREATE (t5:Task {id: "T000005", title: "Hỗ trợ kích hoạt thẻ C000008", description: "Khách báo lỗi app không nhận diện khuôn mặt", priority: "High", status: "Completed", type: "Xử lý khiếu nại", dueDate: datetime("2024-11-26T12:00:00Z"), createddate: datetime("2024-11-26T08:00:00Z"), assignedToId: "E0003", relatedCustomerId: "C000008", relatedContractId: "", relatedProjectId: ""});
CREATE (t6:Task {id: "T000006", title: "Giải đáp thắc mắc bảo hiểm", description: "Khách hàng C000004 hỏi về điều khoản loại trừ", priority: "Medium", status: "In Progress", type: "Tư vấn", dueDate: datetime("2024-11-29T17:00:00Z"), createddate: datetime("2024-11-27T09:00:00Z"), assignedToId: "E0003", relatedCustomerId: "C000004", relatedContractId: "CT000006", relatedProjectId: ""});

// E4 (Sales) Tasks
CREATE (t7:Task {id: "T000007", title: "Tư vấn tái ký hợp đồng Hòa Bình", description: "Hợp đồng CT000005 đã hết hạn, cần liên hệ mời gói mới", priority: "High", status: "Pending", type: "Gia hạn hợp đồng", dueDate: datetime("2024-12-05T09:00:00Z"), createddate: datetime("2024-11-28T08:00:00Z"), assignedToId: "E0004", relatedCustomerId: "C000003", relatedContractId: "CT000005", relatedProjectId: ""});
CREATE (t8:Task {id: "T000008", title: "Gọi điện khách hàng tiềm năng", description: "Liên hệ chị Bích (C000009) tư vấn gói đầu tư", priority: "Medium", status: "Pending", type: "Gọi điện", dueDate: datetime("2024-12-01T15:00:00Z"), createddate: datetime("2024-11-29T10:00:00Z"), assignedToId: "E0004", relatedCustomerId: "C000009", relatedContractId: "", relatedProjectId: ""});
CREATE (t9:Task {id: "T000009", title: "Thu phí bảo hiểm định kỳ", description: "Nhắc phí khách hàng Minh (C000002)", priority: "Low", status: "In Progress", type: "Thu phí", dueDate: datetime("2024-12-10T17:00:00Z"), createddate: datetime("2024-11-25T17:00:00Z"), assignedToId: "E0004", relatedCustomerId: "C000002", relatedContractId: "CT000003", relatedProjectId: ""});

// Task Relationships
MATCH (t:Task {id: "T000001"}), (e:Employee {id: "E0001"}) MERGE (e)-[:ASSIGNED_TO]->(t);
MATCH (t:Task {id: "T000001"}), (c:Customer {id: "C000001"}) MERGE (t)-[:RELATED_TO]->(c);

MATCH (t:Task {id: "T000002"}), (e:Employee {id: "E0001"}) MERGE (e)-[:ASSIGNED_TO]->(t);

MATCH (t:Task {id: "T000003"}), (e:Employee {id: "E0002"}) MERGE (e)-[:ASSIGNED_TO]->(t);
MATCH (t:Task {id: "T000003"}), (c:Customer {id: "C000010"}) MERGE (t)-[:RELATED_TO]->(c);

MATCH (t:Task {id: "T000004"}), (e:Employee {id: "E0002"}) MERGE (e)-[:ASSIGNED_TO]->(t);

MATCH (t:Task {id: "T000005"}), (e:Employee {id: "E0003"}) MERGE (e)-[:ASSIGNED_TO]->(t);
MATCH (t:Task {id: "T000005"}), (c:Customer {id: "C000008"}) MERGE (t)-[:RELATED_TO]->(c);

MATCH (t:Task {id: "T000006"}), (e:Employee {id: "E0003"}) MERGE (e)-[:ASSIGNED_TO]->(t);
MATCH (t:Task {id: "T000006"}), (c:Customer {id: "C000004"}) MERGE (t)-[:RELATED_TO]->(c);

MATCH (t:Task {id: "T000007"}), (e:Employee {id: "E0004"}) MERGE (e)-[:ASSIGNED_TO]->(t);
MATCH (t:Task {id: "T000007"}), (c:Customer {id: "C000003"}) MERGE (t)-[:RELATED_TO]->(c);

MATCH (t:Task {id: "T000008"}), (e:Employee {id: "E0004"}) MERGE (e)-[:ASSIGNED_TO]->(t);
MATCH (t:Task {id: "T000008"}), (c:Customer {id: "C000009"}) MERGE (t)-[:RELATED_TO]->(c);

MATCH (t:Task {id: "T000009"}), (e:Employee {id: "E0004"}) MERGE (e)-[:ASSIGNED_TO]->(t);
MATCH (t:Task {id: "T000009"}), (c:Customer {id: "C000002"}) MERGE (t)-[:RELATED_TO]->(c);

// =========================================================
// 9. INTERACTIONS
// =========================================================
CREATE (i1:Interaction {id: "INT001", type: "Meeting", description: "Gặp mặt tại Gem Center, bàn về gói đầu tư mới", date: datetime("2024-11-27T09:00:00Z")});
CREATE (i2:Interaction {id: "INT002", type: "Call", description: "Gọi điện tư vấn về lãi suất thẻ tín dụng", date: datetime("2024-11-28T10:15:00Z")});
CREATE (i3:Interaction {id: "INT003", type: "Email", description: "Gửi báo giá tái ký hợp đồng tư vấn", date: datetime("2024-11-29T14:30:00Z")});
CREATE (i4:Interaction {id: "INT004", type: "Call", description: "Khách hàng phàn nàn về thái độ nhân viên", date: datetime("2024-11-20T16:00:00Z")});
CREATE (i5:Interaction {id: "INT005", type: "Meeting", description: "Ký hợp đồng bảo hiểm nhân thọ", date: datetime("2023-02-01T09:00:00Z")});
CREATE (i6:Interaction {id: "INT006", type: "Email", description: "Gửi chúc mừng sinh nhật", date: datetime("2024-11-15T08:00:00Z")});
CREATE (i7:Interaction {id: "INT007", type: "Call", description: "Tư vấn nâng cấp hạng thẻ", date: datetime("2024-10-10T11:00:00Z")});
CREATE (i8:Interaction {id: "INT008", type: "Meeting", description: "Họp tổng kết dự án tư vấn", date: datetime("2023-01-01T14:00:00Z")});

// Link Interactions to Customers
MATCH (c:Customer {id: "C000001"}), (i:Interaction {id: "INT001"}) MERGE (c)-[:HAS_INTERACTION]->(i);
MATCH (c:Customer {id: "C000001"}), (i:Interaction {id: "INT005"}) MERGE (c)-[:HAS_INTERACTION]->(i);
MATCH (c:Customer {id: "C000001"}), (i:Interaction {id: "INT006"}) MERGE (c)-[:HAS_INTERACTION]->(i);

MATCH (c:Customer {id: "C000008"}), (i:Interaction {id: "INT002"}) MERGE (c)-[:HAS_INTERACTION]->(i);

MATCH (c:Customer {id: "C000003"}), (i:Interaction {id: "INT003"}) MERGE (c)-[:HAS_INTERACTION]->(i);
MATCH (c:Customer {id: "C000003"}), (i:Interaction {id: "INT008"}) MERGE (c)-[:HAS_INTERACTION]->(i);

MATCH (c:Customer {id: "C000006"}), (i:Interaction {id: "INT004"}) MERGE (c)-[:HAS_INTERACTION]->(i);

MATCH (c:Customer {id: "C000002"}), (i:Interaction {id: "INT007"}) MERGE (c)-[:HAS_INTERACTION]->(i);

// =========================================================
// 10. JOURNEY (Sample)
// =========================================================
CREATE (j1:Journey {step: "Awareness", detail: "Khách hàng biết đến qua Facebook Ads", date: datetime("2023-01-01T00:00:00Z")});
CREATE (j2:Journey {step: "Consideration", detail: "Khách hàng tham dự hội thảo đầu tư", date: datetime("2023-01-10T00:00:00Z")});
CREATE (j3:Journey {step: "Purchase", detail: "Ký hợp đồng đầu tiên", date: datetime("2023-02-01T00:00:00Z")});
CREATE (j4:Journey {step: "Loyalty", detail: "Nâng hạng thành viên VIP", date: datetime("2024-01-01T00:00:00Z")});

MATCH (c:Customer {id: "C000001"}), (j:Journey {step: "Awareness"}) MERGE (c)-[:HAS_JOURNEY]->(j);
MATCH (c:Customer {id: "C000001"}), (j:Journey {step: "Consideration"}) MERGE (c)-[:HAS_JOURNEY]->(j);
MATCH (c:Customer {id: "C000001"}), (j:Journey {step: "Purchase"}) MERGE (c)-[:HAS_JOURNEY]->(j);
MATCH (c:Customer {id: "C000001"}), (j:Journey {step: "Loyalty"}) MERGE (c)-[:HAS_JOURNEY]->(j);
