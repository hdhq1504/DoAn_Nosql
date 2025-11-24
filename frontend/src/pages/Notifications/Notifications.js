import React, { useState } from "react";
import {
  Card,
  List,
  Avatar,
  Button,
  Tag,
  Space,
  Typography,
  Row,
  Col,
  Statistic,
  Segmented,
  Popconfirm,
  Badge,
  Empty,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  MailOutlined,
  UserAddOutlined,
  FileTextOutlined,
  DollarCircleOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import "./Notifications.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "customer",
      icon: <UserAddOutlined />,
      color: "#52c41a",
      title: "Khách hàng mới",
      description: "Nguyễn Văn An vừa đăng ký tài khoản",
      time: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      type: "contract",
      icon: <FileTextOutlined />,
      color: "#1890ff",
      title: "Hợp đồng mới",
      description: "Hợp đồng #1234 cần được duyệt",
      time: new Date(Date.now() - 10 * 60 * 1000),
      read: false,
    },
    {
      id: "3",
      type: "task",
      icon: <CalendarOutlined />,
      color: "#faad14",
      title: "Công việc sắp hết hạn",
      description: "3 công việc sẽ hết hạn trong 24 giờ tới",
      time: new Date(Date.now() - 60 * 60 * 1000),
      read: false,
    },
    {
      id: "4",
      type: "payment",
      icon: <DollarCircleOutlined />,
      color: "#722ed1",
      title: "Thanh toán thành công",
      description: "Khách hàng Trần Thị Bình đã thanh toán ₫45M",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "5",
      type: "customer",
      icon: <UserAddOutlined />,
      color: "#52c41a",
      title: "Khách hàng mới",
      description: "Công ty TNHH ABC đã đăng ký gói doanh nghiệp",
      time: new Date(Date.now() - 3 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "6",
      type: "contract",
      icon: <FileTextOutlined />,
      color: "#1890ff",
      title: "Hợp đồng đã ký",
      description: "Hợp đồng #1230 đã được ký thành công",
      time: new Date(Date.now() - 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "7",
      type: "task",
      icon: <CalendarOutlined />,
      color: "#faad14",
      title: "Công việc hoàn thành",
      description: "Lê Minh Cường đã hoàn thành công việc 'Gọi điện tư vấn'",
      time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      read: true,
    },
    {
      id: "8",
      type: "payment",
      icon: <DollarCircleOutlined />,
      color: "#722ed1",
      title: "Thanh toán thất bại",
      description: "Giao dịch #5678 bị từ chối. Vui lòng kiểm tra lại",
      time: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      read: true,
    },
  ]);

  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.read).length,
    read: notifications.filter((n) => n.read).length,
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAsUnread = (id) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: false } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="notifications-page">
      <Title level={2}>Thông báo</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng thông báo"
              value={stats.total}
              prefix={<BellOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chưa đọc"
              value={stats.unread}
              prefix={<MailOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã đọc"
              value={stats.read}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card className="toolbar-card">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Segmented
              value={filter}
              onChange={setFilter}
              options={[
                { label: "Tất cả", value: "all" },
                { label: "Chưa đọc", value: "unread" },
                { label: "Đã đọc", value: "read" },
              ]}
              size="large"
            />
          </Col>
          <Col xs={24} md={12} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleMarkAllAsRead}
              disabled={stats.unread === 0}
            >
              Đánh dấu tất cả đã đọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Notifications List */}
      <Card className="notifications-card">
        {filteredNotifications.length === 0 ? (
          <Empty description="Không có thông báo" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={filteredNotifications}
            renderItem={(item) => (
              <List.Item
                className={`notification-item ${!item.read ? "unread" : ""}`}
                actions={[
                  item.read ? (
                    <Button
                      type="text"
                      size="small"
                      onClick={() => handleMarkAsUnread(item.id)}
                    >
                      Đánh dấu chưa đọc
                    </Button>
                  ) : (
                    <Button
                      type="text"
                      size="small"
                      onClick={() => handleMarkAsRead(item.id)}
                    >
                      Đánh dấu đã đọc
                    </Button>
                  ),
                  <Popconfirm
                    title="Xóa thông báo"
                    description="Bạn có chắc muốn xóa thông báo này?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Button
                      type="text"
                      danger
                      size="small"
                      icon={<DeleteOutlined />}
                    />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Badge dot={!item.read} offset={[-5, 5]}>
                      <Avatar
                        icon={item.icon}
                        style={{ backgroundColor: item.color }}
                        size={48}
                      />
                    </Badge>
                  }
                  title={
                    <Space>
                      <Text strong style={{ fontSize: 15 }}>
                        {item.title}
                      </Text>
                      {!item.read && (
                        <Tag color="orange" style={{ fontSize: 11 }}>
                          Mới
                        </Tag>
                      )}
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary">{item.description}</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {dayjs(item.time).fromNow()}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
}
