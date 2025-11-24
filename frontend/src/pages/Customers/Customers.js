import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  DatePicker,
  Spin,
  Alert,
  message,
} from "antd";
import {
  UserOutlined,
  CrownOutlined,
  ShopOutlined,
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { customerAPI } from "../../services/api";
import "./Customers.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterSegment, setFilterSegment] = useState("all");
  const [form] = Form.useForm();

  // Fetch customers from API
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await customerAPI.getAll();
      setCustomers(response.data || []);
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError("Không thể tải dữ liệu khách hàng. Vui lòng kiểm tra kết nối API.");
      message.error("Lỗi khi tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  };

  // Statistics
  const stats = {
    total: customers.length,
    vip: customers.filter((c) => c.segment === "VIP").length,
    business: customers.filter((c) => c.segment === "Doanh nhân").length,
    new: customers.filter((c) => {
      const created = new Date(c.createdDate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return created > monthAgo;
    }).length,
  };

  // Filter customers
  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.phone?.includes(searchText);

    const matchesSegment =
      filterSegment === "all" || customer.segment === filterSegment;

    return matchesSearch && matchesSegment;
  });

  // Table columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      fixed: "left",
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      width: 180,
      fixed: "left",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: 200,
      render: (_, record) => (
        <div>
          <div>{record.phone || "-"}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
            {record.email || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Loại",
      dataIndex: "type",
      key: "type",
      width: 120,
    },
    {
      title: "Phân khúc",
      dataIndex: "segment",
      key: "segment",
      width: 130,
      render: (segment) => {
        let color = "blue";
        if (segment === "VIP") color = "purple";
        else if (segment === "Doanh nhân") color = "green";
        return <Tag color={color}>{segment}</Tag>;
      },
      filters: [
        { text: "VIP", value: "VIP" },
        { text: "Doanh nhân", value: "Doanh nhân" },
        { text: "Thành viên", value: "Thành viên" },
      ],
      onFilter: (value, record) => record.segment === value,
    },
    {
      title: "Công ty",
      dataIndex: "company",
      key: "company",
      width: 150,
      render: (text) => text || "-",
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Giá trị",
      dataIndex: "lifetimeValue",
      key: "lifetimeValue",
      width: 130,
      align: "right",
      render: (value) => `₫${Number(value || 0).toLocaleString("vi-VN")}`,
      sorter: (a, b) => (a.lifetimeValue || 0) - (b.lifetimeValue || 0),
    },
    {
      title: "Đánh giá",
      dataIndex: "satisfactionScore",
      key: "satisfactionScore",
      width: 100,
      align: "center",
      render: (score) => score || 0,
      sorter: (a, b) =>
        (a.satisfactionScore || 0) - (b.satisfactionScore || 0),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdDate",
      key: "createdDate",
      width: 120,
      render: (date) =>
        date ? dayjs(date).format("DD/MM/YYYY") : "-",
      sorter: (a, b) =>
        new Date(a.createdDate || 0) - new Date(b.createdDate || 0),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa khách hàng"
            description="Bạn có chắc muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      ...customer,
      createdDate: customer.createdDate ? dayjs(customer.createdDate) : null,
      lastContact: customer.lastContact ? dayjs(customer.lastContact) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await customerAPI.delete(id);
      message.success("Xóa khách hàng thành công");
      fetchCustomers(); // Refresh list
    } catch (err) {
      console.error("Error deleting customer:", err);
      message.error("Lỗi khi xóa khách hàng");
    }
  };

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formattedValues = {
        ...values,
        createdDate: values.createdDate
          ? values.createdDate.toISOString()
          : new Date().toISOString(),
        lastContact: values.lastContact
          ? values.lastContact.toISOString()
          : new Date().toISOString(),
      };

      if (editingCustomer) {
        // Update existing customer
        await customerAPI.update(editingCustomer.id, formattedValues);
        message.success("Cập nhật khách hàng thành công");
      } else {
        // Add new customer
        const newCustomer = {
          id: `C${Date.now()}`,
          ...formattedValues,
        };
        await customerAPI.create(newCustomer);
        message.success("Thêm khách hàng thành công");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchCustomers(); // Refresh list
    } catch (err) {
      console.error("Error saving customer:", err);
      message.error("Lỗi khi lưu khách hàng");
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div className="customers-page">
      <Title level={2}>Quản lý Khách hàng</Title>

      {error && (
        <Alert
          message="Lỗi kết nối"
          description={error}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng khách hàng"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="VIP"
              value={stats.vip}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Doanh nhân"
              value={stats.business}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Khách hàng mới"
              value={stats.new}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card className="toolbar-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              value={filterSegment}
              onChange={setFilterSegment}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả phân khúc</Option>
              <Option value="VIP">VIP</Option>
              <Option value="Doanh nhân">Doanh nhân</Option>
              <Option value="Thành viên">Thành viên</Option>
            </Select>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm khách hàng
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="id"
            scroll={{ x: 1500 }}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} khách hàng`,
            }}
          />
        </Spin>
      </Card>

      {/* Modal */}
      <Modal
        title={editingCustomer ? "Chỉnh sửa khách hàng" : "Thêm khách hàng mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={800}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="id"
                label="ID"
                rules={[{ required: true, message: "Vui lòng nhập ID" }]}
              >
                <Input disabled={!!editingCustomer} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Tên khách hàng"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                ]}
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
              <Form.Item name="type" label="Loại khách hàng">
                <Select>
                  <Option value="Cá nhân">Cá nhân</Option>
                  <Option value="Doanh nghiệp">Doanh nghiệp</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="segment" label="Phân khúc">
                <Select>
                  <Option value="VIP">VIP</Option>
                  <Option value="Doanh nhân">Doanh nhân</Option>
                  <Option value="Thành viên">Thành viên</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="company" label="Công ty">
            <Input />
          </Form.Item>

          <Form.Item name="address" label="Địa chỉ">
            <Input.TextArea rows={2} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="lifetimeValue" label="Giá trị (₫)">
                <Input type="number" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="satisfactionScore" label="Điểm hài lòng">
                <Input type="number" min={0} max={10} step={0.1} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="createdDate" label="Ngày tạo">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="lastContact" label="Liên hệ cuối">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Active">Active</Option>
              <Option value="Inactive">Inactive</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
