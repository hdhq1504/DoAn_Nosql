import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  message,
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
import { API_BASE_URL, notificationAPI } from "../../services/api";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Title, Text } = Typography;

const TYPE_CONFIG = {
  customer: { icon: <UserAddOutlined />, color: "#52c41a" },
  contract: { icon: <FileTextOutlined />, color: "#1890ff" },
  task: { icon: <CalendarOutlined />, color: "#faad14" },
  payment: { icon: <DollarCircleOutlined />, color: "#722ed1" },
};

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState({ total: 0, unread: 0, read: 0 });
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
  const [loading, setLoading] = useState(false);

  const baseApiUrl = useMemo(() => API_BASE_URL.replace(/\/api$/, ""), []);

  const fetchNotifications = useCallback(
    async (page = pagination.current, pageSize = pagination.pageSize) => {
      setLoading(true);
      try {
        const response = await notificationAPI.getList({ filter, page, pageSize });
        setNotifications(response.data.items || []);
        setSummary(response.data.summary || { total: 0, unread: 0, read: 0 });
        setPagination((prev) => ({ ...prev, current: page, pageSize, total: response.data.total || 0 }));
      } catch (error) {
        console.error("Failed to load notifications", error);
        message.error("Không thể tải danh sách thông báo");
      } finally {
        setLoading(false);
      }
    },
    [filter, pagination.current, pagination.pageSize]
  );

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const source = new EventSource(`${baseApiUrl}/api/notification/stream`, { withCredentials: true });
    source.onmessage = () => {
      fetchNotifications();
    };
    source.onerror = (err) => {
      console.error("Notification stream error", err);
      source.close();
    };

    return () => {
      source.close();
    };
  }, [baseApiUrl, fetchNotifications]);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as read", error);
      message.error("Không thể cập nhật thông báo");
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await notificationAPI.markUnread(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to mark as unread", error);
      message.error("Không thể cập nhật thông báo");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllRead();
      fetchNotifications(1, pagination.pageSize);
    } catch (error) {
      console.error("Failed to mark all as read", error);
      message.error("Không thể cập nhật thông báo");
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationAPI.delete(id);
      fetchNotifications();
    } catch (error) {
      console.error("Failed to delete notification", error);
      message.error("Không thể xóa thông báo");
    }
  };

  const handlePageChange = (page, pageSize) => {
    fetchNotifications(page, pageSize);
  };

  const stats = {
    total: summary.total,
    unread: summary.unread,
    read: summary.read,
  };

  const filterOptions = [
    { label: "Tất cả", value: "all" },
    { label: "Chưa đọc", value: "unread" },
    { label: "Đã đọc", value: "read" },
  ];

  return (
    <div className="notifications-page">
      <Title level={2}>Thông báo</Title>

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

      <Card className="toolbar-card">
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Segmented
              value={filter}
              onChange={(value) => {
                setFilter(value);
                fetchNotifications(1, pagination.pageSize);
              }}
              options={filterOptions}
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

      <Card className="notifications-card">
        {notifications.length === 0 ? (
          <Empty description="Không có thông báo" />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              onChange: handlePageChange,
              showSizeChanger: true,
              pageSizeOptions: [5, 10, 20],
            }}
            renderItem={(item) => {
              const config = TYPE_CONFIG[item.type] || { icon: <BellOutlined />, color: "#1890ff" };
              return (
                <List.Item
                  className={`notification-item ${!item.isRead ? "unread" : ""}`}
                  actions={[
                    item.isRead ? (
                      <Button type="text" size="small" onClick={() => handleMarkAsUnread(item.id)}>
                        Đánh dấu chưa đọc
                      </Button>
                    ) : (
                      <Button type="text" size="small" onClick={() => handleMarkAsRead(item.id)}>
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
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Badge dot={!item.isRead} offset={[-5, 5]}>
                        <Avatar icon={config.icon} style={{ backgroundColor: config.color }} size={48} />
                      </Badge>
                    }
                    title={
                      <Space>
                        <Text strong style={{ fontSize: 15 }}>
                          {item.title}
                        </Text>
                        {!item.isRead && (
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
                          {dayjs(item.createdAt).fromNow()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </Card>
    </div>
  );
}
