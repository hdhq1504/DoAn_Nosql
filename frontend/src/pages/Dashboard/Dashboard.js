import React, { useEffect, useState } from "react";
import {
  Row, Col, Card, Typography, Spin, message,
  Avatar, Progress, Badge, Button
} from "antd";
import {
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  TeamOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { analyticsAPI, taskAPI } from "../../services/api";
import "./Dashboard.css";

const { Title, Text } = Typography;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalRevenue: 0,
    totalEmployees: 0,
    totalTasks: 0,
    activeCampaigns: 0,
    totalLeads: 0,
    customerGrowth: 0,
    revenueGrowth: 0,
    taskGrowth: 0,
    employeeGrowth: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [taskStats, setTaskStats] = useState([]);
  const [topEmployees, setTopEmployees] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  // Chart colors
  const COLORS = {
    primary: "#1890ff",
    success: "#52c41a",
    warning: "#faad14",
    danger: "#ff4d4f",
    purple: "#722ed1",
    cyan: "#13c2c2",
  };

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [dashboardRes, revenueRes, employeeRes, tasksRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getMonthlyRevenue(),
        analyticsAPI.getEmployeePerformance(),
        taskAPI.getAll()
      ]);

      const realTasks = tasksRes.data || [];

      const pendingCount = realTasks.filter(t => t.status === "Pending").length;
      const inProgressCount = realTasks.filter(t => t.status === "In Progress").length;
      const completedCount = realTasks.filter(t => t.status === "Completed").length;

      setStats({
        ...dashboardRes.data,
        totalTasks: realTasks.length,
        customerGrowth: 2.5,
        revenueGrowth: 0.8,
        taskGrowth: -0.2,
        employeeGrowth: 0.12,
      });

      const formattedRevenue = revenueRes.data.map((item) => ({
        month: `T${item.month}`,
        revenue: Math.round(item.totalRevenue / 1000000),
        target: Math.round((item.totalRevenue * 1.1) / 1000000),
      }));
      setRevenueData(formattedRevenue);

      setTaskStats([
        { name: "Pending", value: pendingCount, color: COLORS.warning },
        { name: "In Progress", value: inProgressCount, color: COLORS.primary },
        { name: "Completed", value: completedCount, color: COLORS.success },
      ]);

      const formattedEmployees = employeeRes.data
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5)
        .map((emp, index) => ({
          ...emp,
          rank: index + 1,
          revenueDisplay: `₫${(emp.totalRevenue / 1000000).toFixed(1)}M`,
        }));
      setTopEmployees(formattedEmployees);

      setRecentActivities([
        {
          type: "contract",
          customer: "Công ty TNHH ABC",
          action: "Ký hợp đồng mới",
          amount: "280 Tr",
          time: "5 phút trước",
        },
        {
          type: "task",
          customer: "Nguyễn Văn An",
          action: "Hoàn thành tư vấn",
          amount: "45 Tr",
          time: "15 phút trước",
        },
        {
          type: "lead",
          customer: "Trần Thị Bình",
          action: "Lead mới từ website",
          amount: "Potential: 120 Tr",
          time: "1 giờ trước",
        },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      message.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const metricCards = [
    {
      title: "Tổng khách hàng",
      value: stats.totalCustomers,
      growth: stats.customerGrowth,
      icon: <UserOutlined />,
      color: COLORS.primary,
      bgGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      title: "Doanh thu",
      value: `${(stats.totalRevenue / 1000000).toFixed(1)} Tr`,
      growth: stats.revenueGrowth,
      icon: <DollarOutlined />,
      color: COLORS.success,
      bgGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      title: "Tasks",
      value: stats.totalTasks,
      growth: stats.taskGrowth,
      icon: <CheckCircleOutlined />,
      color: COLORS.warning,
      bgGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      title: "Nhân viên",
      value: stats.totalEmployees,
      growth: stats.employeeGrowth,
      icon: <TeamOutlined />,
      color: COLORS.purple,
      bgGradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    },
  ];

  if (loading) {
    return (
      <div className="dashboard__loading">
        <Spin size="large" tip="Đang tải...">
          <div style={{ padding: 100 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <Title level={2} style={{ margin: 0 }}>Dashboard</Title>
          <Text type="secondary">Tổng quan hoạt động kinh doanh CRM</Text>
        </div>
        <Button icon={<ArrowUpOutlined />} onClick={fetchDashboardData}>
          Làm mới
        </Button>
      </div>

      <Row gutter={[24, 24]} className="dashboard__row dashboard__row--metrics">
        {metricCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="metric-card" hoverable>
              <div className="metric-card__icon" style={{ background: card.bgGradient }}>
                {card.icon}
              </div>
              <div className="metric-card__content">
                <Text className="metric-card__title">{card.title}</Text>
                <div className="metric-card__value-row">
                  <Title level={3} className="metric-card__value">{card.value}</Title>
                  <Badge
                    count={
                      <span className={`metric-card__growth metric-card__growth--${card.growth >= 0 ? 'positive' : 'negative'}`}>
                        {card.growth >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                        {Math.abs(card.growth)}%
                      </span>
                    }
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]} className="dashboard__row dashboard__row--charts">
        <Col xs={24} lg={16}>
          <Card title="Doanh thu theo tháng" className="chart-card">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#8c8c8c" />
                <YAxis stroke="#8c8c8c" />
                <Tooltip
                  formatter={(value) => `₫${value}M`}
                  contentStyle={{ borderRadius: 8, border: '1px solid #f0f0f0' }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={COLORS.primary}
                  fill="url(#colorRevenue)"
                  strokeWidth={2}
                  name="Doanh thu"
                />
                <Area
                  type="monotone"
                  dataKey="target"
                  stroke={COLORS.danger}
                  strokeDasharray="5 5"
                  fill="none"
                  strokeWidth={2}
                  name="Mục tiêu"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Phân bố công việc" className="chart-card">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={taskStats}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {taskStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-card__summary">
              {taskStats.map((stat, index) => (
                <div key={index} className="chart-card__stat-item">
                  <span className="chart-card__stat-dot" style={{ background: stat.color }} />
                  <Text>{stat.name}: </Text>
                  <Text strong>{stat.value}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard__row dashboard__row--content">
        <Col xs={24} lg={14}>
          <Card
            title={
              <span>
                <TrophyOutlined style={{ color: COLORS.warning, marginRight: 8 }} />
                Top nhân viên xuất sắc
              </span>
            }
            className="employee-board"
          >
            <div className="employee-board__list">
              {topEmployees.map((emp) => (
                <div key={emp.employeeId} className="employee-board__item">
                  <div className="employee-board__rank">#{emp.rank}</div>
                  <Avatar size={44} icon={<UserOutlined />} />
                  <div className="employee-board__info">
                    <Text strong>{emp.employeeName}</Text>
                    <Text type="secondary" className="employee-board__customers">
                      {emp.totalCustomers} khách hàng
                    </Text>
                  </div>
                  <div className="employee-board__revenue">
                    <Text strong className="employee-board__revenue-amount">{emp.revenueDisplay}</Text>
                    <Progress
                      percent={Math.min(100, (emp.rank === 1 ? 100 : 100 - emp.rank * 15))}
                      showInfo={false}
                      strokeColor={{
                        '0%': COLORS.primary,
                        '100%': COLORS.purple,
                      }}
                      size="small"
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Hoạt động gần đây"
            extra={<Button type="link">Xem tất cả</Button>}
            className="activity-board"
          >
            <div className="activity-board__list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="activity-board__item">
                  <div className="activity-board__icon-wrapper">
                    <ClockCircleOutlined className="activity-board__icon" />
                  </div>
                  <div className="activity-board__content">
                    <Text strong>{activity.customer}</Text>
                    <Text type="secondary" className="activity-board__action">
                      {activity.action}
                    </Text>
                    <Text type="secondary" className="activity-board__time">
                      {activity.time}
                    </Text>
                  </div>
                  <div className="activity-board__amount">
                    <Text strong>{activity.amount}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
