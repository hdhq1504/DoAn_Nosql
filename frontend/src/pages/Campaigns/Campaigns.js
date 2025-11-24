import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  Tag,
  Popconfirm,
  Row,
  Col,
  Card,
  Statistic,
  Typography,
  Progress,
  InputNumber,
  message,
  Spin
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  RocketOutlined,
  PauseCircleOutlined,
  CheckCircleOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { campaignAPI } from "../../services/api";
import "./Campaigns.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [form] = Form.useForm();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await campaignAPI.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      message.error("Không thể tải danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Statistics
  const stats = {
    total: campaigns.length,
    active: campaigns.filter((c) => c.status === "Active").length,
    paused: campaigns.filter((c) => c.status === "Paused").length,
    completed: campaigns.filter((c) => c.status === "Completed").length,
    totalBudget: campaigns.reduce((sum, c) => sum + (c.budget || 0), 0),
    totalSpent: campaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
  };

  const getStatusTag = (status) => {
    const statusMap = {
      Active: { color: "success", text: "Đang chạy", icon: <RocketOutlined /> },
      Paused: { color: "warning", text: "Tạm dừng", icon: <PauseCircleOutlined /> },
      Completed: { color: "default", text: "Hoàn thành", icon: <CheckCircleOutlined /> },
    };
    const config = statusMap[status] || statusMap.Active;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Tên chiến dịch",
      dataIndex: "name",
      key: "name",
      width: 200,
      fixed: "left",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
            Target: {record.target}
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
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 130,
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Đang chạy", value: "Active" },
        { text: "Tạm dừng", value: "Paused" },
        { text: "Hoàn thành", value: "Completed" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Thời gian",
      key: "duration",
      width: 180,
      render: (_, record) => (
        <div>
          <div>{dayjs(record.startDate).format("DD/MM/YYYY")}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>
            đến {dayjs(record.endDate).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Ngân sách",
      dataIndex: "budget",
      key: "budget",
      width: 130,
      align: "right",
      render: (value) => `₫${Number(value || 0).toLocaleString("vi-VN")}`,
      sorter: (a, b) => (a.budget || 0) - (b.budget || 0),
    },
    {
      title: "Đã chi",
      dataIndex: "spent",
      key: "spent",
      width: 130,
      align: "right",
      render: (value) => `₫${Number(value || 0).toLocaleString("vi-VN")}`,
      sorter: (a, b) => (a.spent || 0) - (b.spent || 0),
    },
    {
      title: "Tiến độ",
      key: "progress",
      width: 120,
      render: (_, record) => {
        const percent = record.budget
          ? Math.round(((record.spent || 0) / record.budget) * 100)
          : 0;
        return <Progress percent={percent} size="small" />;
      },
    },
    {
      title: "Leads",
      dataIndex: "leads",
      key: "leads",
      width: 80,
      align: "center",
      sorter: (a, b) => (a.leads || 0) - (b.leads || 0),
    },
    {
      title: "Chuyển đổi",
      dataIndex: "conversions",
      key: "conversions",
      width: 100,
      align: "center",
      sorter: (a, b) => (a.conversions || 0) - (b.conversions || 0),
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Xóa chiến dịch"
            description="Bạn có chắc muốn xóa chiến dịch này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleEdit = (campaign) => {
    setEditingCampaign(campaign);
    form.setFieldsValue({
      ...campaign,
      startDate: campaign.startDate ? dayjs(campaign.startDate) : null,
      endDate: campaign.endDate ? dayjs(campaign.endDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await campaignAPI.delete(id);
      message.success("Đã xóa chiến dịch");
      fetchCampaigns();
    } catch (error) {
      message.error("Không thể xóa chiến dịch");
    }
  };

  const handleAdd = () => {
    setEditingCampaign(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const formattedValues = {
          ...values,
          startDate: values.startDate ? values.startDate.toISOString() : null,
          endDate: values.endDate ? values.endDate.toISOString() : null,
        };

        if (editingCampaign) {
          await campaignAPI.update(editingCampaign.id, formattedValues);
          message.success("Đã cập nhật chiến dịch");
        } else {
          await campaignAPI.create({
            ...formattedValues,
            id: `CAM${Date.now()}` // Generate ID if backend doesn't
          });
          message.success("Đã thêm chiến dịch mới");
        }
        setIsModalOpen(false);
        form.resetFields();
        fetchCampaigns();
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
      <div className="campaigns-loading">
        <Spin size="large" tip="Đang tải chiến dịch...">
          <div style={{ height: 200 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="campaigns-page-modern">
      <Title level={2}>Quản lý Chiến dịch</Title>

      {/* Statistics */}
      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng chiến dịch"
              value={stats.total}
              prefix={<RocketOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đang chạy"
              value={stats.active}
              prefix={<RocketOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng ngân sách"
              value={formatMoney(stats.totalBudget)}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đã chi tiêu"
              value={formatMoney(stats.totalSpent)}
              prefix={<DollarOutlined />}
              suffix="₫"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Toolbar */}
      <Card className="toolbar-card">
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={4} style={{ margin: 0 }}>
              Danh sách chiến dịch
            </Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              size="large"
            >
              Thêm chiến dịch
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Table */}
      <Card className="table-card">
        <Table
          columns={columns}
          dataSource={campaigns}
          rowKey="id"
          scroll={{ x: 1400 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng số ${total} chiến dịch`,
          }}
        />
      </Card>

      {/* Modal */}
      <Modal
        title={editingCampaign ? "Chỉnh sửa chiến dịch" : "Thêm chiến dịch mới"}
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
                name="name"
                label="Tên chiến dịch"
                rules={[{ required: true, message: "Vui lòng nhập tên" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="target" label="Mục tiêu">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Loại chiến dịch">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="Active">Đang chạy</Option>
                  <Option value="Paused">Tạm dừng</Option>
                  <Option value="Completed">Hoàn thành</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="budget" label="Ngân sách (₫)">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="spent" label="Đã chi (₫)">
                <InputNumber
                  style={{ width: "100%" }}
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="leads" label="Leads">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="conversions" label="Chuyển đổi">
                <InputNumber style={{ width: "100%" }} min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="startDate" label="Ngày bắt đầu">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="endDate" label="Ngày kết thúc">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
