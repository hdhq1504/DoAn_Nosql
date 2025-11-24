import React, { useState } from "react";
import { ConfigProvider, Layout } from "antd";
import "./App.css";
import Sidebar from "./components/Sidebar/Sidebar";
import Topbar from "./components/Topbar/Topbar";

import Dashboard from "./pages/Dashboard/Dashboard";
import Customers from "./pages/Customers/Customers";
import Products from "./pages/Products/Products";
import Tasks from "./pages/Tasks/Tasks";
import Campaigns from "./pages/Campaigns/Campaigns";
import Reports from "./pages/Reports/Reports";
import Profile from "./pages/Profile/Profile";
import Notifications from "./pages/Notifications/Notifications";
import Employees from "./pages/Employees/Employees";

const { Content } = Layout;

export default function App() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "customers":
        return <Customers />;
      case "products":
        return <Products />;
      case "tasks":
        return <Tasks />;
      case "campaigns":
        return <Campaigns />;
      case "reports":
        return <Reports />;
      case "employees":
        return <Employees />;
      case "profile":
        return <Profile />;
      case "notifications":
        return <Notifications />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
        <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
          <Topbar onProfileClick={() => setPage("profile")} collapsed={collapsed} setCollapsed={setCollapsed} onNotificationsClick={() => setPage("notifications")} />
          <Content className="main-content">{renderPage()}</Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
