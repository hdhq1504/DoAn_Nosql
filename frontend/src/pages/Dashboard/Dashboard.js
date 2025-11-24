import React from "react";
import { Row, Col, Card, Statistic, List, Avatar, Progress, Typography, Tag } from "antd";
import {
  UserOutlined,
  DollarOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ArrowUpOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

const { Title, Text } = Typography;

export default function Dashboard() {
  const statsData = [
    {
      title: "Tổng khách hàng",
      value: 2847,
      prefix: <UserOutlined />,
      suffix: <ArrowUpOutlined style={{ color: "#52c41a", fontSize: 12 }} />,
      valueStyle: { color: "#1890ff" },
      precision: 0,
      growth: "+12%",
    },
    {
      title: "Doanh thu tháng này",
      value: 4200000000,
      prefix: <DollarOutlined />,
      suffix: "₫",
      valueStyle: { color: "#52c41a" },
      precision: 1,
      growth: "+8%",
    },
    {
      title: "Hợp đồng mới",
      value: 156,
      prefix: <FileTextOutlined />,
      valueStyle: { color: "#722ed1" },
      precision: 0,
      growth: "+23%",
    },
    {
      title: "Công việc chờ",
      value: 28,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: "#fa8c16" },
      precision: 0,
      growth: "+5%",
    },
  ];

  // Chart data
  const revenueData = [
    { month: "T1", revenue: 2800, target: 3000 },
    { month: "T2", revenue: 3200, target: 3200 },
    { month: "T3", revenue: 3600, target: 3400 },
    { month: "T4", revenue: 3400, target: 3600 },
    { month: "T5", revenue: 3900, target: 3800 },
    { month: "T6", revenue: 4200, target: 4000 },
  ];

  const customerGrowthData = [
    { month: "T1", new: 120, total: 2400 },
    { month: "T2", new: 145, total: 2545 },
    { month: "T3", new: 132, total: 2677 },
    { month: "T4", new: 156, total: 2833 },
    { month: "T5", new: 142, total: 2975 },
    { month: "T6", new: 168, total: 3143 },
  ];

  const recentActivities = [
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
    {
      name: "Lê Minh Cường",
      action: "Đặt lịch meeting tư vấn",
      amount: "-",
      time: "2 giờ trước",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    },
    {
      name: "Phạm Thu Hà",
      action: "Yêu cầu báo giá bảo hiểm sức khỏe",
      amount: "₫35M",
      time: "3 giờ trước",
      avatar: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1",
    },
  ];

  const topStaff = [
    {
      name: "Nguyễn Thị Mai",
      role: "Senior Consultant",
      value: "₫890M",
      contracts: "45 HD",
      avatar: "https://images.unsplash.com/photo-1607746882042-944635dfe10e",
    },
    {
      name: "Trần Văn Hùng",
      role: "Sales Manager",
      value: "₫756M",
      contracts: "38 HD",
      avatar: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1",
    },
    {
      name: "Lê Thị Lan",
      role: "Consultant",
      value: "₫645M",
      contracts: "32 HD",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    },
    {
      name: "Phạm Minh Tuấn",
      role: "Senior Consultant",
      value: "₫598M",
      contracts: "29 HD",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
    },
  ];

  const pipelineData = [
    { stage: "Tiếp cận", customers: 145, value: "₫2.8B", percent: 90, color: "#1890ff" },
    { stage: "Tư vấn", customers: 89, value: "₫1.9B", percent: 70, color: "#722ed1" },
    { stage: "Đề xuất", customers: 56, value: "₫1.2B", percent: 50, color: "#faad14" },
    { stage: "Đàm phán", customers: 34, value: "₫890M", percent: 35, color: "#fa8c16" },
    { stage: "Chốt đơn", customers: 23, value: "₫650M", percent: 30, color: "#52c41a" },
  ];

  return (
    <div className="dashboard-modern">
      <Title level={2} className="dashboard-title">
        Bảng điều khiển
      </Title>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="stats-row">
        {statsData.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
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
          <Card title="Doanh thu 6 tháng gần đây" className="chart-card">
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
            extra={<a href="#">Xem tất cả</a>}
            className="activity-card"
          >
            <List
              itemLayout="horizontal"
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item
                  extra={
                    <div className="activity-meta">
                      <Text strong className="activity-amount">
                        {item.amount}
                      </Text>
                      <Text type="secondary" className="activity-time">
                        {item.time}
                      </Text>
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      item.avatar ? (
                        <Avatar src={item.avatar} size={48} />
                      ) : (
                        <Avatar icon={<UserOutlined />} size={48} />
                      )
                    }
                    title={<Text strong>{item.name}</Text>}
                    description={item.action}
                  />
                </List.Item>
              )}
            />
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
            <List
              itemLayout="horizontal"
              dataSource={topStaff}
              renderItem={(item, index) => (
                <List.Item
                  extra={
                    <div className="staff-value">
                      <Text strong>{item.value}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {item.contracts}
                      </Text>
                    </div>
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        src={item.avatar}
                        size={44}
                        style={{
                          border: index === 0 ? "2px solid #faad14" : "none",
                        }}
                      />
                    }
                    title={<Text strong>{item.name}</Text>}
                    description={<Text type="secondary">{item.role}</Text>}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Sales Pipeline */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="Phiếu bán hàng" extra={<a href="#">Xem chi tiết</a>}>
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


