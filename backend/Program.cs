using backend.Service;
using Microsoft.OpenApi.Models;
using Neo4j.Driver;

var builder = WebApplication.CreateBuilder(args);

// Cấu hình appsettings.json
builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Thêm CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins(
                      "http://localhost:3000", 
                      "https://localhost:3000",
                      "http://localhost:3001",
                      "https://localhost:3001",
                      "http://127.0.0.1:3000",
                      "https://127.0.0.1:3000",
                      "http://127.0.0.1:3001",
                      "https://127.0.0.1:3001"
                  )
                  .AllowAnyMethod()
                  .AllowAnyHeader()
                  .AllowCredentials();
        });
});

// Thêm services
builder.Services.AddControllers();

// Đăng ký CustomerService
builder.Services.AddSingleton<CustomerService>();
builder.Services.AddScoped<ProductService>();
builder.Services.AddScoped<CampaignService>();
builder.Services.AddScoped<TaskService>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<ContractService>();
builder.Services.AddScoped<EmployeeService>();
builder.Services.AddSingleton<NotificationService>();
builder.Services.AddScoped<AuthService>();

// Cấu hình Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Customer API",
        Version = "v1",
        Description = "API quản lý khách hàng sử dụng Neo4j HTTP API"
    });
});

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Customer API v1");
        c.RoutePrefix = string.Empty; // Mở Swagger tại /
    });
}

// Sử dụng CORS (phải đặt trước UseHttpsRedirection)
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
