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
  Space,
  Tag,
  Popconfirm,
  Typography,
  Image,
  InputNumber,
  Statistic,
  message,
  Spin
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
import { productAPI } from "../../services/api";
import "./Products.css";

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [form] = Form.useForm();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productAPI.getAll();
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      message.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
    form.setFieldsValue({
      ...product,
      commissionRate: product.commissionRate * 100 // Convert back to percentage for display
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await productAPI.delete(id);
      message.success("Đã xóa sản phẩm");
      fetchProducts();
    } catch (error) {
      message.error("Không thể xóa sản phẩm");
    }
  };

  const handleAdd = () => {
    setEditingProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const productData = {
          ...values,
          commissionRate: values.commissionRate / 100 // Convert to decimal
        };

        if (editingProduct) {
          // Include id in the payload for PATCH request
          await productAPI.update(editingProduct.id, {
            ...productData,
            id: editingProduct.id
          });
          message.success("Đã cập nhật sản phẩm");
        } else {
          await productAPI.create({
            ...productData,
            id: `PROD${Date.now()}` // Generate ID if backend doesn't
          });
          message.success("Đã thêm sản phẩm mới");
        }
        setIsModalOpen(false);
        form.resetFields();
        fetchProducts();
      } catch (error) {
        message.error("Có lỗi xảy ra");
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const formatMoney = (value) => Number(value || 0).toLocaleString("vi-VN");

  if (loading) {
    return (
      <div className="products-loading">
        <Spin size="large" tip="Đang tải sản phẩm...">
          <div style={{ height: 200 }} />
        </Spin>
      </div>
    );
  }

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
                <Option value="Tư vấn">Tư vấn</Option>
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
                    src={product.image || "https://via.placeholder.com/200?text=Product"}
                    fallback="https://via.placeholder.com/200?text=Product"
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
                  <Option value="Tư vấn">Tư vấn</Option>
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
