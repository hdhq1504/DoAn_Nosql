import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Popconfirm,
  Typography,
  Image,
  InputNumber,
  Statistic,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  SearchOutlined,
  ShoppingOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";
import { mockProducts } from "../../data/mockData";
import "./Products.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function Products() {
  const [products, setProducts] = useState(
    mockProducts.map((p) => ({ ...p, key: p.id }))
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  // Statistics
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "Active").length,
    inactive: products.filter((p) => p.status === "Inactive").length,
    totalValue: products.reduce((sum, p) => sum + (p.price || 0), 0),
  };

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchText.toLowerCase());

    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;

    const matchesStatus =
      filterStatus === "all" || product.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleEdit = (product) => {
    setEditingProduct(product);
    form.setFieldsValue(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingProduct) {
        // Update existing product
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id ? { ...p, ...values } : p
          )
        );
      } else {
        // Add new product
        const newProduct = {
          id: `P${Date.now()}`,
          key: `P${Date.now()}`,
          ...values,
        };
        setProducts([...products, newProduct]);
      }

      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

  return (
    <div className="products-page-modern">
      <Title level={2}>Quản lý Sản phẩm</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng sản phẩm"
              value={stats.total}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang hoạt động"
              value={stats.active}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Ngừng hoạt động"
              value={stats.inactive}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giá trị"
              value={formatMoney(stats.totalValue)}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card className="toolbar-card">
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Space size="middle" wrap>
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 250 }}
                allowClear
              />
              <Select
                value={filterCategory}
                onChange={setFilterCategory}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả loại</Option>
                <Option value="Bảo hiểm">Bảo hiểm</Option>
                <Option value="Đầu tư">Đầu tư</Option>
                <Option value="Tiết kiệm">Tiết kiệm</Option>
              </Select>
              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
              >
                <Option value="all">Tất cả trạng thái</Option>
                <Option value="Active">Hoạt động</Option>
                <Option value="Inactive">Ngừng</Option>
              </Select>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm sản phẩm
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Products Grid */}
      <Row gutter={[16, 16]}>
        {filteredProducts.map((product) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={product.id}>
            <Card
              hoverable
              className="product-card-modern"
              cover={
                <div className="product-image-wrapper">
                  <Image
                    alt={product.name}
                    src={product.image}
                    fallback="data:image/png;base64,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"
                    preview={false}
                    style={{ height: 200, objectFit: "cover" }}
                  />
                </div>
              }
              actions={[
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={() => handleEdit(product)}
                >
                  Sửa
                </Button>,
                <Popconfirm
                  title="Xóa sản phẩm"
                  description="Bạn có chắc muốn xóa sản phẩm này?"
                  onConfirm={() => handleDelete(product.id)}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button type="text" danger icon={<DeleteOutlined />}>
                    Xóa
                  </Button>
                </Popconfirm>,
              ]}
            >
              <div className="product-card-content">
                <Title level={4} ellipsis={{ rows: 1 }}>
                  {product.name}
                </Title>
                <Space direction="vertical" size="small" style={{ width: "100%" }}>
                  <div>
                    <Text type="secondary">Loại: </Text>
                    <Tag color="blue">{product.category}</Tag>
                  </div>
                  <div>
                    <Text type="secondary">Giá: </Text>
                    <Text strong style={{ color: "#52c41a", fontSize: 16 }}>
                      ₫{formatMoney(product.price)}
                    </Text>
                  </div>
                  <div>
                    <Text type="secondary">Thời hạn: </Text>
                    <Text>{product.duration} tháng</Text>
                  </div>
                  <div>
                    <Text type="secondary">Hoa hồng: </Text>
                    <Text>{(product.commissionRate * 100).toFixed(0)}%</Text>
                  </div>
                  <div>
                    <Text type="secondary">Trạng thái: </Text>
                    <Tag color={product.status === "Active" ? "success" : "error"}>
                      {product.status === "Active" ? "Hoạt động" : "Ngừng"}
                    </Tag>
                  </div>
                  <div>
                    <Text type="secondary" ellipsis>
                      {product.description}
                    </Text>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {filteredProducts.length === 0 && (
        <Card style={{ textAlign: "center", padding: "40px 0" }}>
          <Text type="secondary">Không tìm thấy sản phẩm nào</Text>
        </Card>
      )}

      {/* Modal */}
      <Modal
        title={editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên sản phẩm"
            rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm" }]}
          >
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="Loại sản phẩm">
                <Select>
                  <Option value="Bảo hiểm">Bảo hiểm</Option>
                  <Option value="Đầu tư">Đầu tư</Option>
                  <Option value="Tiết kiệm">Tiết kiệm</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="Active">Hoạt động</Option>
                  <Option value="Inactive">Ngừng</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="price" label="Giá (₫)">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="duration" label="Thời hạn (tháng)">
                <InputNumber style={{ width: "100%" }} min={1} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="commissionRate" label="Hoa hồng (%)">
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              max={100}
              step={0.1}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace("%", "")}
            />
          </Form.Item>

          <Form.Item name="image" label="URL hình ảnh">
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
