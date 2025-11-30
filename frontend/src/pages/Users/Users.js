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
  Drawer,
  Select,
  Form,
  Row,
  Col,
  Divider,
  Modal // Import Modal here
} from "antd";
import { generateNextId } from "../../utils/idGenerator";
import { employeeAPI } from "../../services/api";
import {
  PlusOutlined,
  SearchOutlined,
  MoreOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  IdcardOutlined,
  MailOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons";
import axios from "axios";
import "./Users.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

  const API_URL = "https://localhost:5001/api";

  useEffect(() => {
    fetchUsers(current, pageSize, searchText, roleFilter);
    fetchEmployees();
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

  const fetchEmployees = async () => {
    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
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
      title: 'Xóa người dùng?',
      icon: <ExclamationCircleOutlined />,
      content: 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa?',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.delete(`${API_URL}/user/${id}`);
          message.success('Đã xóa người dùng');
          fetchUsers(current, pageSize, searchText, roleFilter);
        } catch (error) {
          message.error('Xóa thất bại');
        }
      },
    });
  };

  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue({
      ...record,
      // If user is linked to an employee but doesn't have employeeId in record (legacy), try to find by email
      employeeId: record.employeeId || employees.find(e => e.email === record.email)?.id
    });
    setIsDrawerOpen(true);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    const nextId = generateNextId(users, "U", 4);
    form.setFieldsValue({ id: nextId, status: "Active", roleId: "ROLE03" });
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    form.resetFields();
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      // Add employeeId to values if selected
      if (values.roleId === 'ROLE03' && values.employeeId) {
        // Logic handled in backend via EmployeeId property
      }

      if (editingUser) {
        await axios.put(`${API_URL}/user/${editingUser.id}`, values);
        message.success("Cập nhật thành công");
      } else {
        await axios.post(`${API_URL}/user`, values);
        message.success("Thêm mới thành công");
      }
      setIsDrawerOpen(false);
      fetchUsers(current, pageSize, searchText, roleFilter);
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Có lỗi xảy ra khi lưu thông tin");
    }
  };

  const columns = [
    {
      title: "Người dùng",
      dataIndex: "username",
      key: "username",
      render: (text, record) => (
        <Space>
          <Avatar src={record.avatar} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text strong>{record.employeeName || text}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.email}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Thông tin nhân viên",
      key: "employeeInfo",
      render: (_, record) => (
        record.employeePosition ? (
          <Space direction="vertical" size={0}>
            <Tag color="blue">{record.employeePosition}</Tag>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.employeeDepartment}</Text>
          </Space>
        ) : <Text type="secondary">-</Text>
      )
    },
    {
      title: "Vai trò",
      dataIndex: "roleName",
      key: "roleName",
      render: (roleName, record) => {
        let color = "default";
        let icon = <UserOutlined />;
        let label = roleName || "User";

        if (record.roleId === "ROLE01") {
          color = "red";
          icon = <SafetyCertificateOutlined />;
          label = "Admin";
        } else if (record.roleId === "ROLE02") {
          color = "gold";
          icon = <IdcardOutlined />;
          label = "Quản lý";
        } else if (record.roleId === "ROLE03") {
          color = "blue";
          label = "Nhân viên";
        }

        return (
          <Tag color={color} icon={icon} style={{ borderRadius: 12, padding: '4px 10px' }}>
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
        <Tag color={status === "Active" ? "success" : "error"}>
          {status === "Active" ? "Hoạt động" : "Ngưng hoạt động"}
        </Tag>
      )
    },
    {
      key: "action",
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "1", label: "Chỉnh sửa", icon: <EditOutlined />, onClick: () => handleEdit(record) },
              { type: 'divider' },
              { key: "2", label: "Xóa", icon: <DeleteOutlined />, danger: true, onClick: () => handleDelete(record.id) },
            ],
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="user-management-page">
      <div className="page-header">
        <div className="header-title">
          <Title level={3}>Quản lý thành viên</Title>
          <Text type="secondary">Quản lý tài khoản và phân quyền truy cập</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} size="large">
          Thêm thành viên
        </Button>
      </div>

      <div className="stats-container">
        <Card className="stat-card active" bordered={false}>
          <div className="stat-value">{total}</div>
          <div className="stat-label">Tổng thành viên</div>
        </Card>
        <Card className="stat-card" bordered={false}>
          <div className="stat-value">{users.filter(u => u.status === 'Active').length}</div>
          <div className="stat-label">Đang hoạt động</div>
        </Card>
      </div>

      <div className="filters-container">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder="Tìm kiếm theo tên hoặc email..."
          style={{ width: 300 }}
          onChange={handleSearch}
          value={searchText}
          allowClear
        />
        <Select
          value={roleFilter}
          style={{ width: 200 }}
          onChange={handleRoleFilterChange}
          placeholder="Lọc theo vai trò"
        >
          <Option value="">Tất cả vai trò</Option>
          <Option value="ROLE01">Admin</Option>
          <Option value="ROLE02">Quản lý</Option>
          <Option value="ROLE03">Nhân viên</Option>
        </Select>
      </div>

      <div className="table-container">
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          pagination={{
            current: current,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} kết quả`
          }}
          loading={loading}
          onChange={handleTableChange}
          className="members-table"
        />
      </div>

      <Drawer
        title={editingUser ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"}
        width={500}
        onClose={handleDrawerClose}
        open={isDrawerOpen}
        className="user-drawer"
        extra={
          <Button type="primary" onClick={handleSave}>Lưu thay đổi</Button>
        }
      >
        <Form form={form} layout="vertical" requiredMark="optional">
          <Form.Item name="id" hidden><Input /></Form.Item>

          <Divider orientation="left">Thông tin đăng nhập</Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" }
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder="example@company.com" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Tên đăng nhập"
                rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
              >
                <Input prefix={<UserOutlined />} placeholder="username" disabled={!!editingUser} />
              </Form.Item>
            </Col>
            <Col span={12}>
              {!editingUser && (
                <Form.Item
                  name="password"
                  label="Mật khẩu"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
                >
                  <Input.Password placeholder="••••••" />
                </Form.Item>
              )}
            </Col>
          </Row>

          <Divider orientation="left">Phân quyền & Liên kết</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="roleId"
                label="Vai trò"
                rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
              >
                <Select placeholder="Chọn vai trò">
                  <Option value="ROLE01">Admin</Option>
                  <Option value="ROLE02">Quản lý</Option>
                  <Option value="ROLE03">Nhân viên</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Select>
                  <Option value="Active">Hoạt động</Option>
                  <Option value="Inactive">Ngưng hoạt động</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.roleId !== currentValues.roleId}
          >
            {({ getFieldValue }) => {
              const roleId = getFieldValue('roleId');
              return (roleId === 'ROLE03' || roleId === 'ROLE02') ? (
                <Form.Item
                  name="employeeId"
                  label="Liên kết nhân viên"
                  tooltip="Chọn nhân viên để tự động đồng bộ thông tin và quyền hạn"
                  rules={[{ required: roleId === 'ROLE03', message: "Vui lòng chọn nhân viên để liên kết" }]}
                >
                  <Select
                    showSearch
                    placeholder="Tìm kiếm nhân viên..."
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    onChange={(value) => {
                      const emp = employees.find(e => e.id === value);
                      if (emp) {
                        form.setFieldsValue({
                          email: emp.email,
                          username: emp.email.split('@')[0],
                          employeeName: emp.name
                        });
                      }
                    }}
                    options={employees.map(emp => ({
                      value: emp.id,
                      label: `${emp.name} (${emp.email})`
                    }))}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            name="employeeName"
            label="Tên hiển thị"
            rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" />
          </Form.Item>

        </Form>
      </Drawer>
    </div>
  );
}
