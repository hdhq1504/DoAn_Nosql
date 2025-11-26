import React, { useState } from "react";
import { ConfigProvider, Layout } from "antd";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Contracts from "./pages/Contracts/Contracts";
import Login from "./pages/Login/Login";

import Users from "./pages/Users/Users";

const { Content } = Layout;

function ProtectedRoute({ children }) {
  const user = localStorage.getItem("user");
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function MainLayout() {
  const [page, setPage] = useState("dashboard");
  const [collapsed, setCollapsed] = useState(false);

  // Sync state with URL if needed, or just keep simple for now

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "customers": return <Customers />;
      case "products": return <Products />;
      case "tasks": return <Tasks />;
      case "campaigns": return <Campaigns />;
      case "reports": return <Reports />;
      case "employees": return <Employees />;
      case "contracts": return <Contracts />;
      case "profile": return <Profile />;
      case "notifications": return <Notifications />;
      case "users": return <Users />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar page={page} setPage={setPage} collapsed={collapsed} setCollapsed={setCollapsed} />
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'margin-left 0.2s' }}>
        <Topbar onProfileClick={() => setPage("profile")} collapsed={collapsed} setCollapsed={setCollapsed} onNotificationsClick={() => setPage("notifications")} />
        <Content className="main-content">{renderPage()}</Content>
      </Layout>
    </Layout>
  );
}

export default function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1890ff",
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
