### Thiết lập Cơ sở dữ liệu

1. **Cài đặt và khởi động Neo4j**:

   ```bash
   # Nếu dùng Neo4j Desktop, tạo một database mới
   # Nếu dùng Neo4j Community Edition, khởi động service
   ```

2. **Cấu hình Neo4j**:

   - HTTP endpoint mặc định: `http://localhost:7474`
   - Bolt endpoint mặc định: `bolt://localhost:7687`
   - Username: `neo4j`
   - Password: `12345678`

3. **Tạo database**:

   ```cypher
   CREATE DATABASE doan;
   :use doan;
   ```

### Thiết lập Backend

1. **Di chuyển vào thư mục backend**:

   ```bash
   cd backend
   ```

2. **Khôi phục các gói phụ thuộc**:

   ```bash
   dotnet restore
   ```

3. **Build dự án**:

   ```bash
   dotnet build
   ```

4. **Chạy backend**:

   ```bash
   dotnet run
   ```

5. **Truy cập Swagger UI**:
   - Mở trình duyệt: `https://localhost:5001` hoặc `http://localhost:5064`
   - Tài liệu Swagger sẽ có sẵn tại URL gốc

### Thiết lập Frontend

1. **Di chuyển vào thư mục frontend**:

   ```bash
   cd frontend
   ```

2. **Cài đặt các gói phụ thuộc**:

   ```bash
   npm install
   ```

3. **Khởi động server phát triển**:

   ```bash
   npm start
   ```

4. **Truy cập ứng dụng**:
   - Frontend sẽ tự động mở tại: `http://127.0.0.1:3001`
   - Ứng dụng được cấu hình chạy trên port 3001 (xem scripts trong `package.json`)

### Đăng nhập hệ thống
   - Tài khoản: `admin@crm.vn`
   - Mật khẩu: `123456`
