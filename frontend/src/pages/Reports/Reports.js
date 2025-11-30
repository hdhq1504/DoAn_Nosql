import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Progress
} from "antd";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { analyticsAPI } from "../../services/api";
import { UsergroupAddOutlined, TeamOutlined, DollarOutlined } from "@ant-design/icons";
import "./Reports.css";

const { Title } = Typography;

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [customerData, setCustomerData] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customerRes, employeeRes, revenueRes] = await Promise.all([
          analyticsAPI.getCustomerAnalytics(),
          analyticsAPI.getEmployeePerformance(),
          analyticsAPI.getMonthlyRevenue()
        ]);

        setCustomerData(customerRes.data);
        setEmployeeData(employeeRes.data);
        setRevenueData(revenueRes.data);
      } catch (error) {
        console.error("Error fetching report data:", error);
        message.error("Không thể tải dữ liệu báo cáo");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="reports-loading">
        <Spin size="large" tip="Đang tải báo cáo..." />
      </div>
    );
  }

  const customerColumns = [
    { title: "Phân khúc", dataIndex: "segment", key: "segment" },
    { title: "Số lượng KH", dataIndex: "customerCount", key: "customerCount", sorter: (a, b) => a.customerCount - b.customerCount },
    { title: "Giá trị TB (LTV)", dataIndex: "averageLTV", key: "averageLTV", render: (val) => `₫${val.toLocaleString()}` },
    { title: "Điểm hài lòng", dataIndex: "averageSatisfaction", key: "averageSatisfaction", render: (val) => <Progress percent={val * 10} steps={5} size="small" strokeColor="#52c41a" showInfo={false} /> },
    { title: "Tương tác TB", dataIndex: "averageInteractions", key: "averageInteractions" },
  ];

  const employeeColumns = [
    { title: "Nhân viên", dataIndex: "employeeName", key: "employeeName" },
    { title: "Khách hàng", dataIndex: "totalCustomers", key: "totalCustomers", sorter: (a, b) => a.totalCustomers - b.totalCustomers },
    { title: "Tasks hoàn thành", dataIndex: "completedTasks", key: "completedTasks", sorter: (a, b) => a.completedTasks - b.completedTasks },
    { title: "Doanh thu", dataIndex: "totalRevenue", key: "totalRevenue", render: (val) => `₫${val.toLocaleString()}`, sorter: (a, b) => a.totalRevenue - b.totalRevenue },
    { title: "Hoa hồng", dataIndex: "totalCommission", key: "totalCommission", render: (val) => `₫${val.toLocaleString()}` },
    { title: "Hiệu suất", dataIndex: "performanceScore", key: "performanceScore", render: (val) => <Progress percent={val * 10} size="small" showInfo={false} strokeColor="#1890ff" /> },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="reports-page">
      <div className="reports-header">
        <h1 className="reports-title">Báo cáo & Phân tích</h1>
        <p className="reports-subtitle">Tổng quan hiệu suất kinh doanh và nhân sự</p>
      </div>

      <div className="report-section">
        <div className="section-header">
          <span className="section-title"><UsergroupAddOutlined /> Phân tích Khách hàng</span>
        </div>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={10}>
            <Card className="report-card" bordered={false} title="Phân bố theo phân khúc">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="customerCount"
                    nameKey="segment"
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={14}>
            <Card className="report-card" bordered={false} title="Chi tiết chỉ số phân khúc">
              <Table
                dataSource={customerData}
                columns={customerColumns}
                rowKey="segment"
                pagination={false}
                size="middle"
              />
            </Card>
          </Col>
        </Row>
      </div>

      <div className="report-section">
        <div className="section-header">
          <span className="section-title"><TeamOutlined /> Hiệu suất Nhân viên</span>
        </div>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Card className="report-card" bordered={false} title="Bảng xếp hạng hiệu suất">
              <Table
                dataSource={employeeData}
                columns={employeeColumns}
                rowKey="employeeId"
                pagination={false}
              />
            </Card>
          </Col>
          <Col span={24}>
            <Card className="report-card" bordered={false} title="Biểu đồ doanh thu & hoa hồng">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={employeeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="employeeName" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: '#f3f4f6' }}
                    formatter={(value) => `₫${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#3b82f6" name="Doanh thu" radius={[4, 4, 0, 0]} barSize={40} />
                  <Bar dataKey="totalCommission" fill="#10b981" name="Hoa hồng" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="report-section">
        <div className="section-header">
          <span className="section-title"><DollarOutlined /> Báo cáo Doanh thu</span>
        </div>
        <Card className="report-card" bordered={false} title="Xu hướng doanh thu theo tháng">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" tickFormatter={(val) => `T${val}`} axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f3f4f6' }}
                formatter={(value) => `₫${value.toLocaleString()}`}
              />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#6366f1" name="Doanh thu" radius={[4, 4, 0, 0]} barSize={50} />
              <Bar dataKey="totalCommission" fill="#f59e0b" name="Hoa hồng" radius={[4, 4, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
