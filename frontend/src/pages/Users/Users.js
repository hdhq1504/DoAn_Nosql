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
  Select,
  Form
} from "antd";
import { generateNextId } from "../../utils/idGenerator";
import { employeeAPI } from "../../services/api";
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
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const [searchText, setSearchText] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form] = Form.useForm();

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
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleAdd = async () => {
    setEditingUser(null);
    form.resetFields();
    const nextId = generateNextId(users, "U", 4);
    form.setFieldsValue({ id: nextId, status: "Active" });

    try {
      const res = await employeeAPI.getAll();
      setEmployees(res.data || []);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }

    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await axios.put(`${API_URL}/user/${editingUser.id}`, values);
        message.success("Cập nhật người dùng thành công");
      } else {
        await axios.post(`${API_URL}/user`, values);
        message.success("Thêm người dùng thành công");
      }
      setIsModalOpen(false);
      fetchUsers(current, pageSize, searchText, roleFilter);
    } catch (error) {
      console.error("Error saving user:", error);
      message.error("Lỗi khi lưu người dùng");
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
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

        if (record.roleId === "ROLE01") {
          color = "red";
          label = "Admin";
        } else if (record.roleId === "ROLE02") {
          color = "gold";
          label = "Quản lý";
        } else if (record.roleId === "ROLE03") {
          color = "blue";
          label = "Nhân viên";
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
          <div className="header-actions">
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Thêm người dùng mới</Button>
          </div>
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
          <Option value="ROLE01">Admin</Option>
          <Option value="ROLE02">Quản lý</Option>
          <Option value="ROLE03">Nhân viên</Option>
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

      <Modal
        title={editingUser ? "Sửa người dùng" : "Thêm người dùng mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form.Item
          name="id"
          label="Mã người dùng"
          hidden
          rules={[{ required: true, message: "Vui lòng nhập mã người dùng" }]}
        >
          <Input disabled />
        </Form.Item>
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập" }]}
          >
            <Input disabled={!!editingUser} />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Vui lòng nhập email" },
              { type: "email", message: "Email không hợp lệ" }
            ]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Mật khẩu"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu" }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="employeeName"
            label="Tên hiển thị"
            rules={[{ required: true, message: "Vui lòng nhập tên hiển thị" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="roleId"
            label="Vai trò"
            rules={[{ required: true, message: "Vui lòng chọn vai trò" }]}
          >
            <Select>
              <Option value="ROLE01">Admin</Option>
              <Option value="ROLE02">Quản lý</Option>
              <Option value="ROLE03">Nhân viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.roleId !== currentValues.roleId}
          >
            {({ getFieldValue }) => {
              const roleId = getFieldValue('roleId');
              return (roleId === 'ROLE03' || roleId === 'ROLE02') ? (
                <Form.Item
                  name="employeeId"
                  label="Chọn nhân viên"
                  help="Chọn nhân viên để tự động điền thông tin"
                >
                  <Select
                    showSearch
                    optionFilterProp="children"
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
                  >
                    {employees.map(emp => (
                      <Option key={emp.id} value={emp.id}>{emp.name} - {emp.email}</Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
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
        </Form>
      </Modal>
    </div>
  );
}
