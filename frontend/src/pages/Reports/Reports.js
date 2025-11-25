import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Table,
  Row,
  Col,
  Typography,
  Spin,
  message,
  Statistic,
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
      <div style={{ textAlign: "center", padding: 50 }}>
        <Spin size="large" tip="Đang tải báo cáo..." />
      </div>
    );
  }

  const customerColumns = [
    { title: "Phân khúc", dataIndex: "segment", key: "segment" },
    { title: "Số lượng KH", dataIndex: "customerCount", key: "customerCount", sorter: (a, b) => a.customerCount - b.customerCount },
    { title: "Giá trị TB (LTV)", dataIndex: "averageLTV", key: "averageLTV", render: (val) => `₫${val.toLocaleString()}` },
    { title: "Điểm hài lòng", dataIndex: "averageSatisfaction", key: "averageSatisfaction", render: (val) => <Progress percent={val * 10} steps={5} size="small" strokeColor="#52c41a" /> },
    { title: "Tương tác TB", dataIndex: "averageInteractions", key: "averageInteractions" },
  ];

  const employeeColumns = [
    { title: "Nhân viên", dataIndex: "employeeName", key: "employeeName" },
    { title: "Khách hàng", dataIndex: "totalCustomers", key: "totalCustomers", sorter: (a, b) => a.totalCustomers - b.totalCustomers },
    { title: "Tasks hoàn thành", dataIndex: "completedTasks", key: "completedTasks", sorter: (a, b) => a.completedTasks - b.completedTasks },
    { title: "Doanh thu", dataIndex: "totalRevenue", key: "totalRevenue", render: (val) => `₫${val.toLocaleString()}`, sorter: (a, b) => a.totalRevenue - b.totalRevenue },
    { title: "Hoa hồng", dataIndex: "totalCommission", key: "totalCommission", render: (val) => `₫${val.toLocaleString()}` },
    { title: "Hiệu suất", dataIndex: "performanceScore", key: "performanceScore", render: (val) => <Progress percent={val} size="small" /> },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Báo cáo & Phân tích</Title>

      <Tabs defaultActiveKey="1" items={[
        {
          key: "1",
          label: <span><UsergroupAddOutlined /> Phân tích Khách hàng</span>,
          children: (
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={12}>
                <Card title="Phân bố khách hàng theo phân khúc">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={customerData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="customerCount"
                        nameKey="segment"
                        label
                      >
                        {customerData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
              <Col xs={24} lg={12}>
                <Card title="Chi tiết phân khúc">
                  <Table dataSource={customerData} columns={customerColumns} rowKey="segment" pagination={false} />
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: "2",
          label: <span><TeamOutlined /> Hiệu suất Nhân viên</span>,
          children: (
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Card title="Bảng xếp hạng nhân viên">
                  <Table dataSource={employeeData} columns={employeeColumns} rowKey="employeeId" />
                </Card>
              </Col>
              <Col span={24}>
                <Card title="Biểu đồ doanh thu nhân viên">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={employeeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="employeeName" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₫${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="totalRevenue" fill="#1890ff" name="Doanh thu" />
                      <Bar dataKey="totalCommission" fill="#52c41a" name="Hoa hồng" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </Col>
            </Row>
          )
        },
        {
          key: "3",
          label: <span><DollarOutlined /> Báo cáo Doanh thu</span>,
          children: (
            <Card title="Xu hướng doanh thu">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickFormatter={(val) => `Tháng ${val}`} />
                  <YAxis />
                  <Tooltip formatter={(value) => `₫${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="totalRevenue" fill="#1890ff" name="Doanh thu" />
                  <Bar dataKey="totalCommission" fill="#faad14" name="Hoa hồng" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )
        }
      ]} />
    </div>
  );
}
