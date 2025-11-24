import React from "react";
import { Layout, Badge, Dropdown, Avatar, Space, Typography, Button } from "antd";
import {
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import "./Topbar.css";

const { Header } = Layout;
const { Text } = Typography;

export default function Topbar({ onProfileClick, collapsed, setCollapsed, onNotificationsClick }) {
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
    },
  ];

  const notificationItems = [
    {
      key: "1",
      label: (
        <div className="notification-item">
          <div className="notification-title">Khách hàng mới</div>
          <div className="notification-desc">Nguyễn Văn An vừa đăng ký</div>
          <div className="notification-time">5 phút trước</div>
        </div>
      ),
    },
    {
      key: "2",
      label: (
        <div className="notification-item">
          <div className="notification-title">Hợp đồng mới</div>
          <div className="notification-desc">Hợp đồng #1234 cần duyệt</div>
          <div className="notification-time">10 phút trước</div>
        </div>
      ),
    },
    {
      key: "3",
      label: (
        <div className="notification-item">
          <div className="notification-title">Công việc</div>
          <div className="notification-desc">3 công việc sắp hết hạn</div>
          <div className="notification-time">1 giờ trước</div>
        </div>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "all",
      label: (
        <div style={{ textAlign: "center", color: "#1890ff", cursor: "pointer" }} onClick={onNotificationsClick}>
          Xem tất cả thông báo
        </div>
      ),
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
            fontSize: '16px',
            width: 40,
            height: 40,
          }}
        />
      </div>

      <div className="topbar-right">
        <Space size="large">
          {/* Notifications */}
          <Dropdown
            menu={{ items: notificationItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Badge count={3} offset={[-2, 2]}>
              <div className="header-icon-btn">
                <BellOutlined />
              </div>
            </Badge>
          </Dropdown>

          {/* Settings */}
          <div className="header-icon-btn">
            <SettingOutlined />
          </div>

          {/* User Menu */}
          <Dropdown
            menu={{ items: userMenuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div className="user-profile">
              <Avatar
                size={36}
                src="https://randomuser.me/api/portraits/men/75.jpg"
                icon={<UserOutlined />}
              />
              <div className="user-info-text">
                <Text strong className="user-name">
                  Admin
                </Text>
                <Text type="secondary" className="user-role">
                  Quản trị viên
                </Text>
              </div>
            </div>
          </Dropdown>
        </Space>
      </div>
    </Header>
  );
}
