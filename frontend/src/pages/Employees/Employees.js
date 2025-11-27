import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Popconfirm,
  Typography,
  Space,
  Table,
  Avatar,
  message,
  Spin,
  DatePicker,
  InputNumber,
  Progress
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  SearchOutlined,
  PhoneOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { employeeAPI } from "../../services/api";
import { generateNextId } from "../../utils/idGenerator";
import dayjs from "dayjs";
import "./Employees.css";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();

  const fetchEmployees = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      messageApi.error("Không thể tải danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      ...employee,
      hiredate: employee.hiredate ? dayjs(employee.hiredate) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await employeeAPI.delete(id);
      messageApi.success("Đã xóa nhân viên");
      fetchEmployees();
    } catch (error) {
      messageApi.error("Không thể xóa nhân viên");
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    form.resetFields();
    const nextId = generateNextId(employees, "E", 4);
    form.setFieldsValue({ id: nextId, status: "Active" });
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const formattedValues = {
          ...values,
          hiredate: values.hiredate ? values.hiredate.toISOString() : null,
          status: values.status || "Active",
        };

        if (editingEmployee) {
          await employeeAPI.update(editingEmployee.id, { ...formattedValues, id: editingEmployee.id });
          messageApi.success("Đã cập nhật nhân viên");
        } else {
          const newEmployee = {
            ...formattedValues,
          };
          await employeeAPI.create(newEmployee);
          messageApi.success("Đã thêm nhân viên mới");
        }
        setIsModalOpen(false);
        form.resetFields();
        fetchEmployees();
      } catch (error) {
        messageApi.error("Có lỗi xảy ra");
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "Nhân viên",
      key: "name",
      width: 250,
      render: (_, record) => (
        <Space size={12}>
          <Avatar
            icon={<UserOutlined />}
            src={record.avatar}
            size={40}
            style={{ border: '2px solid #f0f0f0' }}
          />
          <div>
            <Text strong style={{ display: "block", fontSize: 15 }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>{record.id}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Vị trí & Phòng ban",
      key: "position",
      width: 200,
      render: (_, record) => (
        <div>
          <Text style={{ display: "block", fontWeight: 500 }}>{record.position}</Text>
          <Tag color="blue" style={{ marginTop: 4 }}>{record.department}</Tag>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 250,
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Space>
            <MailOutlined style={{ color: "#1890ff" }} />
            <Text style={{ fontSize: 13 }}>{record.email}</Text>
          </Space>
          <Space>
            <PhoneOutlined style={{ color: "#52c41a" }} />
            <Text style={{ fontSize: 13 }}>{record.phone}</Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag
          color={status === "Active" ? "success" : "error"}
          style={{ borderRadius: 10, padding: '0 10px' }}
        >
          {status === "Active" ? "Đang làm việc" : "Đã nghỉ"}
        </Tag>
      ),
    },
    {
      title: "Hiệu suất",
      dataIndex: "performanceScore",
      key: "performanceScore",
      width: 100,
      render: (score) => (
        <div style={{ textAlign: 'center' }}>
          <Progress
            type="circle"
            percent={score * 10}
            format={() => score}
            width={40}
            strokeColor={score >= 8 ? "#52c41a" : score >= 5 ? "#faad14" : "#ff4d4f"}
          />
        </div>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#1890ff' }}
          />
          <Popconfirm
            title="Xóa nhân viên"
            description="Bạn có chắc muốn xóa nhân viên này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.name.toLowerCase().includes(searchText.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchText.toLowerCase())
  );

  if (loading) {
    return (
      <div className="employees-loading">
        <Spin size="large" tip="Đang tải...">
          <div style={{ height: 200, width: "100%" }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="employees-page">
      {contextHolder}
      <div className="page-header">
        <Title level={2}>Quản lý Nhân viên</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Thêm nhân viên
        </Button>
      </div>

      <Card className="toolbar-card">
        <Input
          placeholder="Tìm kiếm nhân viên theo tên hoặc email..."
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
      </Card>

      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={filteredEmployees}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingEmployee ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="id"
                label="Mã nhân viên"
                hidden
                rules={[{ required: true, message: "Vui lòng nhập mã nhân viên" }]}
              >
                <Input disabled={!!editingEmployee} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="hiredate" label="Ngày vào làm">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="position" label="Vị trí">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="department" label="Phòng ban">
                <Select>
                  <Option value="Sales">Sales</Option>
                  <Option value="Marketing">Marketing</Option>
                  <Option value="IT">IT</Option>
                  <Option value="HR">HR</Option>
                  <Option value="Support">Support</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="Active">Đang làm việc</Option>
                  <Option value="Inactive">Đã nghỉ</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="performanceScore"
                label="Điểm hiệu suất"
                rules={[
                  { type: "number", min: 0, max: 10, message: "Điểm phải từ 0 đến 10" }
                ]}
              >
                <InputNumber min={0} max={10} step={0.1} style={{ width: "100%" }} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
