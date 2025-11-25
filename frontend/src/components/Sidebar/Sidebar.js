import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  ShoppingOutlined,
  CheckSquareOutlined,
  SoundOutlined,
  BarChartOutlined,
  TeamOutlined,
  BellOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import "./Sidebar.css";

const { Sider } = Layout;

export default function Sidebar({ page, setPage, collapsed, setCollapsed }) {
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Bảng điều khiển",
    },
    {
      key: "customers",
      icon: <UserOutlined />,
      label: "Quản lý Khách hàng",
    },
    {
      key: "employees",
      icon: <TeamOutlined />,
      label: "Quản lý Nhân viên",
    },
    {
      key: "products",
      icon: <ShoppingOutlined />,
      label: "Quản lý Sản phẩm",
    },
    {
      key: "contracts",
      icon: <FileTextOutlined />,
      label: "Quản lý Hợp đồng",
    },
    {
      key: "tasks",
      icon: <CheckSquareOutlined />,
      label: "Quản lý Công việc",
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "Thông báo",
    },
    {
      key: "campaigns",
      icon: <SoundOutlined />,
      label: "Chiến dịch",
    },
    {
      key: "reports",
      icon: <BarChartOutlined />,
      label: "Báo cáo",
    }
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={250}
      className="sidebar-custom"
      trigger={null}
      style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, zIndex: 1000 }}
    >
      <div className="sidebar-header">
        <div className="logo-container">
          {!collapsed ? (
            <>
              <div className="logo-icon"></div>
              <div className="logo-text">
                <h2>CRM</h2>
                <p>Quản lý khách hàng</p>
              </div>
            </>
          ) : (
            <div className="logo-icon-collapsed"></div>
          )}
        </div>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[page]}
        items={menuItems}
        onClick={({ key }) => setPage(key)}
        className="sidebar-menu"
      />

      {!collapsed && (
        <div className="sidebar-footer">
          <p>© 2025 CRM System</p>
        </div>
      )}
    </Sider>
  );
}
