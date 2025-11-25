import React, { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Tag,
  Space,
  Typography,
  message,
  Spin,
  Row,
  Col,
  Statistic,
  Popconfirm
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { contractAPI, customerAPI, productAPI } from "../../services/api";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [form] = Form.useForm();
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [contractsRes, customersRes, productsRes] = await Promise.all([
        contractAPI.getAll(),
        customerAPI.getAll(),
        productAPI.getAll()
      ]);
      setContracts(contractsRes.data || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu hợp đồng");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingContract(null);
    setSelectedProduct(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (contract) => {
    setEditingContract(contract);
    const product = products.find(p => p.id === contract.productId);
    setSelectedProduct(product);

    form.setFieldsValue({
      ...contract,
      purchaseDate: contract.purchaseDate ? dayjs(contract.purchaseDate) : null,
      expiryDate: contract.expiryDate ? dayjs(contract.expiryDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await contractAPI.delete(id);
      message.success("Đã xóa hợp đồng");
      fetchData();
    } catch (error) {
      message.error("Không thể xóa hợp đồng");
    }
  };

  const handleProductChange = (productId) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product);
    if (product) {
      form.setFieldsValue({
        contractValue: product.price,
        commission: product.price * product.commissionRate,
        duration: product.duration // Optional: auto-set duration if needed
      });
    }
  };

  const calculateCommission = (value) => {
    if (selectedProduct) {
      const commission = value * selectedProduct.commissionRate;
      form.setFieldValue("commission", commission);
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const contractData = {
          ...values,
          purchaseDate: values.purchaseDate ? values.purchaseDate.toISOString() : null,
          expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
          commissionRate: selectedProduct ? selectedProduct.commissionRate : 0
        };

        if (editingContract) {
          await contractAPI.update(editingContract.id, contractData);
          message.success("Đã cập nhật hợp đồng");
        } else {
          await contractAPI.create({
            ...contractData,
            id: `CONT${Date.now()}`,
            status: "Active"
          });
          message.success("Đã tạo hợp đồng mới");
        }
        setIsModalOpen(false);
        fetchData();
      } catch (error) {
        message.error("Có lỗi xảy ra");
      }
    });
  };

  const columns = [
    {
      title: "Mã HĐ",
      dataIndex: "id",
      key: "id",
      width: 100,
    },
    {
      title: "Khách hàng",
      dataIndex: "customerId",
      key: "customerId",
      render: (id) => {
        const customer = customers.find(c => c.id === id);
        return customer ? customer.name : id;
      }
    },
    {
      title: "Sản phẩm",
      dataIndex: "productId",
      key: "productId",
      render: (id) => {
        const product = products.find(p => p.id === id);
        return product ? <Tag color="blue">{product.name}</Tag> : id;
      }
    },
    {
      title: "Giá trị",
      dataIndex: "contractValue",
      key: "contractValue",
      align: "right",
      render: (val) => `₫${Number(val).toLocaleString("vi-VN")}`
    },
    {
      title: "Hoa hồng",
      dataIndex: "commission",
      key: "commission",
      align: "right",
      render: (val) => <Text type="success">₫{Number(val).toLocaleString("vi-VN")}</Text>
    },
    {
      title: "Ngày mua",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "-"
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "success" : status === "Expired" ? "error" : "default"}>
          {status === "Active" ? "Hiệu lực" : status === "Expired" ? "Hết hạn" : status}
        </Tag>
      )
    },
    {
      title: "Hành động",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa hợp đồng"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      )
    }
  ];

  // Stats
  const totalValue = contracts.reduce((sum, c) => sum + (c.contractValue || 0), 0);
  const totalCommission = contracts.reduce((sum, c) => sum + (c.commission || 0), 0);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Quản lý Hợp đồng</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng giá trị hợp đồng"
              value={totalValue}
              prefix={<DollarOutlined />}
              precision={0}
              formatter={(val) => `₫${Number(val).toLocaleString("vi-VN")}`}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Tổng hoa hồng"
              value={totalCommission}
              prefix={<DollarOutlined />}
              precision={0}
              formatter={(val) => `₫${Number(val).toLocaleString("vi-VN")}`}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Hợp đồng hiệu lực"
              value={contracts.filter(c => c.status === "Active").length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      <Card extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tạo hợp đồng
        </Button>
      }>
        <Spin spinning={loading}>
          <Table
            columns={columns}
            dataSource={contracts}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Spin>
      </Card>

      <Modal
        title={editingContract ? "Cập nhật hợp đồng" : "Tạo hợp đồng mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="customerId"
                label="Khách hàng"
                rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
              >
                <Select showSearch optionFilterProp="children">
                  {customers.map(c => (
                    <Option key={c.id} value={c.id}>{c.name} - {c.phone}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="productId"
                label="Sản phẩm"
                rules={[{ required: true, message: "Vui lòng chọn sản phẩm" }]}
              >
                <Select onChange={handleProductChange}>
                  {products.map(p => (
                    <Option key={p.id} value={p.id}>{p.name} ({p.category})</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="purchaseDate"
                label="Ngày mua"
                rules={[{ required: true, message: "Chọn ngày mua" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="expiryDate"
                label="Ngày hết hạn"
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="contractValue"
                label="Giá trị hợp đồng (₫)"
                rules={[{ required: true, message: "Nhập giá trị" }]}
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  onChange={calculateCommission}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="commission"
                label="Hoa hồng (₫)"
              >
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  disabled // Auto-calculated
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="Trạng thái">
            <Select>
              <Option value="Active">Hiệu lực</Option>
              <Option value="Expired">Hết hạn</Option>
              <Option value="Pending">Chờ duyệt</Option>
              <Option value="Cancelled">Đã hủy</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
