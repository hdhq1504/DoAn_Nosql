using Microsoft.AspNetCore.Mvc;
using backend.Service;
using backend.Models;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly AnalyticsService _analyticsService;

        public AnalyticsController(AnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        // ------------------------------------------------------
        // Dashboard tổng quan
        // ------------------------------------------------------
        [HttpGet("dashboard")]
        public async Task<ActionResult<DashboardMetrics>> GetDashboard()
        {
            var result = await _analyticsService.GetDashboardMetricsAsync();
            return Ok(result);
        }

        // ------------------------------------------------------
        // Sales Pipeline - Thống kê giai đoạn bán hàng
        // ------------------------------------------------------
        [HttpGet("pipeline")]
        public async Task<ActionResult<IEnumerable<SalesStage>>> GetSalesPipeline()
        {
            var result = await _analyticsService.GetSalesPipelineAsync();
            return Ok(result);
        }

        // ------------------------------------------------------
        // Báo cáo phân tích khách hàng theo phân khúc
        // ------------------------------------------------------
        [HttpGet("customers")]
        public async Task<ActionResult<IEnumerable<CustomerSegmentReport>>> GetCustomerAnalytics()
        {
            var result = await _analyticsService.GetCustomerAnalyticsAsync();
            return Ok(result);
        }

        // ------------------------------------------------------
        // Báo cáo hiệu suất nhân viên
        // ------------------------------------------------------
        [HttpGet("employees")]
        public async Task<ActionResult<IEnumerable<EmployeePerformance>>> GetEmployeePerformance()
        {
            var result = await _analyticsService.GetEmployeePerformanceAsync();
            return Ok(result);
        }

        // ------------------------------------------------------
        // Báo cáo doanh thu theo tháng
        // ------------------------------------------------------
        [HttpGet("revenue")]
        public async Task<ActionResult<IEnumerable<RevenueReport>>> GetMonthlyRevenue()
        {
            var result = await _analyticsService.GetMonthlyRevenueReportAsync();
            return Ok(result);
        }
    }
}
