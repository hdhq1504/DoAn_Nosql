import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Layout, Badge, Dropdown, Avatar, Space, Typography, Button, message, Empty } from "antd";
import {
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserAddOutlined,
  FileTextOutlined,
  CalendarOutlined,
  DollarCircleOutlined,
} from "@ant-design/icons";
import "./Topbar.css";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import { API_BASE_URL, notificationAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";

dayjs.extend(relativeTime);
dayjs.locale("vi");

const { Header } = Layout;
const { Text } = Typography;

const TYPE_CONFIG = {
  customer: { icon: <UserAddOutlined />, color: "#52c41a" },
  contract: { icon: <FileTextOutlined />, color: "#1890ff" },
  task: { icon: <CalendarOutlined />, color: "#faad14" },
  payment: { icon: <DollarCircleOutlined />, color: "#722ed1" },
};

export default function Topbar({ onProfileClick, collapsed, setCollapsed, onNotificationsClick }) {
  const [latest, setLatest] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const baseApiUrl = useMemo(() => API_BASE_URL.replace(/\/api$/, ""), []);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    message.success("Đăng xuất thành công");
    navigate("/login");
  };

  const fetchLatest = useCallback(async () => {
    try {
      const response = await notificationAPI.getList({ page: 1, pageSize: 5 });
      setLatest(response.data.items || []);
      setUnreadCount(response.data.summary?.unread || 0);
    } catch (error) {
      console.error("Failed to load latest notifications", error);
      // message.error("Không thể tải thông báo mới nhất");
    }
  }, []);

  useEffect(() => {
    fetchLatest();
  }, [fetchLatest]);

  useEffect(() => {
    const source = new EventSource(`${baseApiUrl}/api/notification/stream`, { withCredentials: true });
    source.onmessage = (event) => {
      try {
        const summary = JSON.parse(event.data);
        setUnreadCount(summary.unread ?? 0);
      } catch (error) {
        console.error("Failed to parse notification summary", error);
      }
      fetchLatest();
    };
    source.onerror = (err) => {
      console.error("Notification stream error", err);
      source.close();
    };

    return () => {
      source.close();
    };
  }, [baseApiUrl, fetchLatest]);

  const notificationItems = latest.length
    ? [
      ...latest.map((item) => {
        const config = TYPE_CONFIG[item.type] || { icon: <BellOutlined />, color: "#1890ff" };
        return {
          key: item.id,
          label: (
            <div className="notification-item">
              <div className="notification-title">
                <Space>
                  <Avatar size={28} icon={config.icon} style={{ backgroundColor: config.color }} />
                  <span>{item.title}</span>
                </Space>
              </div>
              <div className="notification-desc">{item.description}</div>
              <div className="notification-time">{dayjs(item.createdAt).fromNow()}</div>
            </div>
          ),
        };
      }),
      { type: "divider" },
      {
        key: "all",
        label: (
          <div style={{ textAlign: "center", color: "#1890ff", cursor: "pointer" }} onClick={onNotificationsClick}>
            Xem tất cả thông báo
          </div>
        ),
      },
    ]
    : [
      {
        key: "empty",
        label: (
          <div style={{ padding: "12px 24px" }}>
            <Empty
              description="Không có thông báo nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              imageStyle={{ height: 48 }}
            />
          </div>
        ),
      },
      { type: "divider" },
      {
        key: "all",
        label: (
          <div style={{ textAlign: "center", color: "#1890ff", cursor: "pointer" }} onClick={onNotificationsClick}>
            Xem tất cả thông báo
          </div>
        ),
      },
    ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <ProfileOutlined />,
      label: "Hồ sơ cá nhân",
      onClick: onProfileClick,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header className="topbar-modern">
      <div className="topbar-left">
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          style={{
            fontSize: "16px",
            width: 40,
            height: 40,
          }}
        />
      </div>

      <div className="topbar-right">
        <Space size="large">
          <Dropdown menu={{ items: notificationItems }} trigger={["click"]} placement="bottomRight">
            <Badge count={unreadCount} offset={[-2, 2]}>
              <div className="header-icon-btn">
                <BellOutlined />
              </div>
            </Badge>
          </Dropdown>

          <div className="header-icon-btn">
            <SettingOutlined />
          </div>

          <Dropdown menu={{ items: userMenuItems }} trigger={["click"]} placement="bottomRight">
            <div className="user-profile">
              <Avatar
                size={36}
                src="https://randomuser.me/api/portraits/men/75.jpg"
                icon={<UserOutlined />}
              />
              <div className="user-info-text">
                <Text strong className="user-name">
                  {user ? user.Username : "Admin"}
                </Text>
                <Text type="secondary" className="user-role">
                  {user ? (user.RoleId === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Nhân viên') : "Quản trị viên"}
                </Text>
              </div>
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
}
