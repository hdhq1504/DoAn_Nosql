import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Avatar, Progress, Typography, Tag, Spin, message, Button } from "antd";
import {
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyticsAPI } from "../../services/api";
import "./Dashboard.css";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTasks: 0,
    totalEmployees: 0,
    activeCampaigns: 0,
    totalLeads: 0
  });
  const [revenueData, setRevenueData] = useState([]);
  const [pipelineData, setPipelineData] = useState([]);
  const [topStaff, setTopStaff] = useState([]);

  const [recentActivities] = useState([
    {
      name: "Nguyễn Văn An",
      action: "Ký hợp đồng bảo hiểm nhân thọ",
      amount: "₫45M",
      time: "10 phút trước",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
    },
    {
      name: "Trần Thị Bình",
      action: "Tư vấn gói đầu tư dài hạn",
      amount: "₫120M",
      time: "25 phút trước",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    },
    {
      name: "Công ty TNHH ABC",
      action: "Gia hạn bảo hiểm doanh nghiệp",
      amount: "₫280M",
      time: "1 giờ trước",
      avatar: null,
    },
  ]);

  const [customerGrowthData] = useState([
    { month: "T1", new: 120, total: 2400 },
    { month: "T2", new: 145, total: 2545 },
    { month: "T3", new: 132, total: 2677 },
    { month: "T4", new: 156, total: 2833 },
    { month: "T5", new: 142, total: 2975 },
    { month: "T6", new: 168, total: 3143 },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardRes, revenueRes, pipelineRes, employeeRes] = await Promise.all([
          analyticsAPI.getDashboard(),
          analyticsAPI.getMonthlyRevenue(),
          analyticsAPI.getPipeline(),
          analyticsAPI.getEmployeePerformance()
        ]);

        setStats(dashboardRes.data);

        // Format Revenue Data
        const formattedRevenue = revenueRes.data.map(item => ({
          month: `T${item.month}`,
          revenue: item.totalRevenue / 1000000,
          target: (item.totalRevenue * 1.1) / 1000000
        }));
        setRevenueData(formattedRevenue);

        // Format Pipeline Data
        const colors = ["#1890ff", "#722ed1", "#faad14", "#fa8c16", "#52c41a"];
        const formattedPipeline = pipelineRes.data.map((item, index) => ({
          stage: item.stage,
          customers: item.dealCount,
          value: `₫${(item.totalValue / 1000000).toFixed(0)}M`,
          percent: Math.min(100, item.dealCount * 10),
          color: colors[index % colors.length]
        }));
        setPipelineData(formattedPipeline);

        // Format Top Staff
        const formattedStaff = employeeRes.data
          .sort((a, b) => b.totalRevenue - a.totalRevenue)
          .slice(0, 4)
          .map(item => ({
            name: item.employeeName,
            role: "Nhân viên",
            value: `₫${(item.totalRevenue / 1000000).toFixed(0)}M`,
            contracts: `${item.totalCustomers} KH`,
            avatar: null
          }));
        setTopStaff(formattedStaff);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        message.error("Không thể tải dữ liệu dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statsCards = [
    {
      title: "Tổng khách hàng",
      value: stats.totalCustomers,
      prefix: <UserOutlined />,
      suffix: <ArrowUpOutlined style={{ color: "#52c41a", fontSize: 12 }} />,
      valueStyle: { color: "#1890ff" },
      precision: 0,
      growth: "+12%",
    },
    {
      title: "Doanh thu tổng",
      value: stats.totalRevenue,
      prefix: <DollarOutlined />,
      suffix: "₫",
      valueStyle: { color: "#52c41a" },
      precision: 0,
      growth: "+8%",
    },
    {
      title: "Nhân viên",
      value: stats.totalEmployees,
      prefix: <FileTextOutlined />,
      valueStyle: { color: "#722ed1" },
      precision: 0,
      growth: "+23%",
    },
    {
      title: "Tổng công việc",
      value: stats.totalTasks,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: "#fa8c16" },
      precision: 0,
      growth: "+5%",
    },
    {
      title: "Chiến dịch đang chạy",
      value: stats.activeCampaigns,
      prefix: <TrophyOutlined />,
      valueStyle: { color: "#eb2f96" },
      precision: 0,
      growth: "Active",
    },
    {
      title: "Tổng Leads",
      value: stats.totalLeads,
      prefix: <UserOutlined />,
      valueStyle: { color: "#fa541c" },
      precision: 0,
      growth: "New",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spin size="large" tip="Đang tải dữ liệu...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="dashboard-modern">
      <Title level={2} className="dashboard-title">
        Bảng điều khiển
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        {statsCards.map((stat, index) => (
          <Col xs={24} sm={12} lg={4} key={index}>
            <Card className="stat-card-modern" hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={stat.precision}
                valueStyle={stat.valueStyle}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
              <Tag color="success" className="growth-tag">
                {stat.growth}
              </Tag>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} className="charts-row">
        <Col xs={24} lg={12}>
          <Card title="Doanh thu theo tháng (Triệu VNĐ)" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1890ff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1890ff" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₫${value}M`} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Doanh thu"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#ff4d4f"
                  strokeDasharray="5 5"
                  name="Mục tiêu"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Tăng trưởng khách hàng" className="chart-card">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={customerGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="new" fill="#52c41a" name="Khách hàng mới" />
                <Bar dataKey="total" fill="#1890ff" name="Tổng khách hàng" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* Main Content Grid */}
      <Row gutter={[16, 16]} className="content-row">
        {/* Recent Activities */}
        <Col xs={24} lg={14}>
          <Card
            title="Hoạt động gần đây"
            extra={<Button type="link">Xem tất cả</Button>}
            className="activity-card"
          >
            <div className="custom-list">
              {recentActivities.map((item, index) => (
                <div key={index} className="custom-list-item" style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ marginRight: 16 }}>
                    {item.avatar ? (
                      <Avatar src={item.avatar} size={48} />
                    ) : (
                      <Avatar icon={<UserOutlined />} size={48} />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block' }}>{item.name}</Text>
                    <Text type="secondary">{item.action}</Text>
                  </div>
                  <div className="activity-meta" style={{ textAlign: 'right' }}>
                    <Text strong className="activity-amount" style={{ display: 'block' }}>
                      {item.amount}
                    </Text>
                    <Text type="secondary" className="activity-time">
                      {item.time}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Top Staff */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span>
                <TrophyOutlined style={{ color: "#faad14", marginRight: 8 }} />
                Nhân viên xuất sắc
              </span>
            }
            className="staff-card"
          >
            <div className="custom-list">
              {topStaff.map((item, index) => (
                <div key={index} className="custom-list-item" style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ marginRight: 16 }}>
                    <Avatar
                      src={item.avatar}
                      size={44}
                      style={{
                        border: index === 0 ? "2px solid #faad14" : "none",
                      }}
                      icon={<UserOutlined />}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Text strong style={{ display: 'block' }}>{item.name}</Text>
                    <Text type="secondary">{item.role}</Text>
                  </div>
                  <div className="staff-value" style={{ textAlign: 'right' }}>
                    <Text strong style={{ display: 'block' }}>{item.value}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.contracts}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Sales Pipeline */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Phiếu bán hàng" extra={<Button type="link">Xem chi tiết</Button>}>
            {pipelineData.map((stage, index) => (
              <div key={index} className="pipeline-stage">
                <div className="stage-header">
                  <Text>
                    <span
                      className="stage-dot"
                      style={{ backgroundColor: stage.color }}
                    />
                    {stage.stage} ({stage.customers} khách hàng)
                  </Text>
                  <Text strong>{stage.value}</Text>
                </div>
                <Progress
                  percent={stage.percent}
                  strokeColor={stage.color}
                  showInfo={false}
                  strokeWidth={10}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
