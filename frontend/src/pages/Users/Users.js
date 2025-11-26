import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Input,
  Card,
  Typography,
  Tag,
  Space,
  Avatar,
  Dropdown,
  message,
  Modal,
  Select
} from "antd";
import {
  PlusOutlined,
  DownloadOutlined,
  SearchOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons";
import axios from "axios";
import "./Users.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

export default function Users() {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const API_URL = "https://localhost:5001/api";

  useEffect(() => {
    fetchUsers(current, pageSize, searchText, roleFilter);
  }, [current, pageSize, searchText, roleFilter]);

  const fetchUsers = async (page, pSize, search, role) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/user`, {
        params: { page, pageSize: pSize, search, role },
      });
      const { data, total: totalCount } = response.data;
      setUsers(data);
      setTotal(totalCount);
    } catch (error) {
      console.error("Error fetching users:", error);
      message.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setCurrent(newPagination.current);
    setPageSize(newPagination.pageSize);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setCurrent(1);
  };

  const handleRoleFilterChange = (value) => {
    setRoleFilter(value);
    setCurrent(1);
  };

  const handleDelete = (id) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa người dùng này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`${API_URL}/user/${id}`);
          message.success('Xóa người dùng thành công');
          fetchUsers(current, pageSize, searchText, roleFilter);
        } catch (error) {
          message.error('Xóa người dùng thất bại');
        }
      },
    });
  };

  const handleEdit = (record) => {
    message.info(`Chức năng sửa cho ${record.username} đang được phát triển`);
    // Implement edit modal here
  };

  const columns = [
    {
      title: (
        <Space>
          Tên <DownloadOutlined style={{ fontSize: 10, transform: "rotate(180deg)" }} />
        </Space>
      ),
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong>
              {record.employeeName || text} {record.email === "admin@crm.com" && <Tag style={{ marginLeft: 4 }}>Bạn</Tag>}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Chức vụ",
      dataIndex: "employeePosition",
      key: "employeePosition",
      render: (text) => text || "-",
    },
    {
      title: "Phòng ban",
      dataIndex: "employeeDepartment",
      key: "employeeDepartment",
      render: (text) => text || "-",
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
      render: (roleName, record) => {
        let color = "default";
        let label = roleName || record.roleId || "User";

        if (label.includes("Admin") || record.roleId === "ROLE_ADMIN") {
          color = "green";
        } else if (label.includes("User") || record.roleId === "ROLE_USER") {
          color = "blue";
        }

        return (
          <Tag color={color} style={{ borderRadius: 12 }}>
            {label}
          </Tag>
        );
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "success" : "default"}>{status || "Unknown"}</Tag>
      )
    },
    {
      title: "Ngày tham gia",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => date ? new Date(date).toLocaleDateString() : "-",
    },
    {
      key: "action",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "Sửa người dùng", icon: <EditOutlined />, onClick: () => handleEdit(record) },
              { key: "2", label: "Xóa người dùng", icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(record.id) },
            ],
          }}
          trigger={["click"]}
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div className="header-title">
          <Title level={3} style={{ margin: 0 }}>Thành viên</Title>
        </div>
        <div className="header-actions">
          <Button type="primary" icon={<PlusOutlined />}>Thêm người dùng mới</Button>
        </div>
      </div>

      <div className="stats-container">
        <Card className="stat-card active">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Tổng thành viên</div>
        </Card>
      </div>

      <div className="filters-container">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Tìm kiếm thành viên"
          style={{ width: 300 }}
          onChange={handleSearch}
          value={searchText}
        />
        <Select
          defaultValue=""
          style={{ width: 200, marginLeft: 10 }}
          onChange={handleRoleFilterChange}
          placeholder="Lọc theo vai trò"
        >
          <Option value="">Tất cả vai trò</Option>
          <Option value="ROLE_ADMIN">Admin</Option>
          <Option value="ROLE_USER">User</Option>
        </Select>
      </div>

      <div className="table-container">
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            current: current,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
          }}
          loading={loading}
          onChange={handleTableChange}
          className="members-table"
        />
      </div>
    </div>
  );
}
