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
  UsergroupAddOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { campaignAPI, customerAPI } from "../../services/api";
import { generateNextId } from "../../utils/idGenerator";
import "./Campaigns.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerIds, setSelectedCustomerIds] = useState([]);
  const [form] = Form.useForm();

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const [campaignsRes, customersRes] = await Promise.all([
        campaignAPI.getAll(),
        customerAPI.getAll(),
      ]);
      setCampaigns(campaignsRes.data);
      setCustomers(customersRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

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
      width: 100,
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
      width: 170,
      align: "right",
      render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`,
      sorter: (a, b) => (a.budget || 0) - (b.budget || 0),
    },
    {
      title: "Đã chi",
      dataIndex: "spent",
      key: "spent",
      width: 170,
      align: "right",
      render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`,
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
      width: 110,
      align: "center",
      sorter: (a, b) => (a.leads || 0) - (b.leads || 0),
    },
    {
      title: "Chuyển đổi",
      dataIndex: "conversions",
      key: "conversions",
      width: 120,
      align: "center",
      sorter: (a, b) => (a.conversions || 0) - (b.conversions || 0),
    },
    {
      title: "Doanh thu",
      dataIndex: "actualRevenue",
      key: "actualRevenue",
      width: 170,
      align: "right",
      render: (value) => `${Number(value || 0).toLocaleString("vi-VN")} VNĐ`,
      sorter: (a, b) => (a.actualRevenue || 0) - (b.actualRevenue || 0),
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

  const handleEdit = async (campaign) => {
    setEditingCampaign(campaign);
    form.setFieldsValue({
      ...campaign,
      startDate: campaign.startDate ? dayjs(campaign.startDate) : null,
      endDate: campaign.endDate ? dayjs(campaign.endDate) : null,
    });

    try {
      const res = await campaignAPI.getTargetCustomers(campaign.id);
      setSelectedCustomerIds(res.data.map(c => c.id));
    } catch (error) {
      setSelectedCustomerIds([]);
    }

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
    setSelectedCustomerIds([]);
    form.resetFields();
    const nextId = generateNextId(campaigns, "CAM", 3);
    form.setFieldsValue({ id: nextId, status: "Active" });
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const formattedValues = {
          ...values,
          startDate: values.startDate ? values.startDate.format("YYYY-MM-DD") : null,
          endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        };

        let campaignId = editingCampaign?.id;

        if (!campaignId && !formattedValues.id) {
          formattedValues.id = generateNextId(campaigns, "CAM", 3);
        }

        if (editingCampaign) {
          await campaignAPI.update(editingCampaign.id, formattedValues);
          message.success("Đã cập nhật chiến dịch");
        } else {
          const res = await campaignAPI.create({
            ...formattedValues,
          });
          campaignId = res.data.id;
          message.success("Đã thêm chiến dịch mới");
        }

        if (selectedCustomerIds.length > 0 && campaignId) {
          await campaignAPI.assignCustomers(campaignId, selectedCustomerIds);
        }

        setIsModalOpen(false);
        form.resetFields();
        fetchCampaigns();
      } catch (error) {
        message.error("Có lỗi xảy ra");
      }
    }).catch((info) => {
      console.log("Validate Failed:", info);
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
        <Spin size="large" tip="Đang tải...">
          <div style={{ height: "100vh" }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="campaigns-page-modern" >
      <Title level={2}>Quản lý Chiến dịch</Title>

      <Row gutter={[16, 16]} className="stats-row" >
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
              suffix="VNĐ"
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
              suffix="VNĐ"
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row >

      < Card className="toolbar-card" >
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
      </Card >

      < Card className="table-card" >
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
      </Card >

      < Modal
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
                name="id"
                label="Mã chiến dịch"
                hidden
                rules={[{ required: true, message: "Vui lòng nhập mã chiến dịch" }]}
              >
                <Input disabled={!!editingCampaign} />
              </Form.Item>
            </Col>
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
              <Form.Item name="budget" label="Ngân sách (VNĐ)">
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
              <Form.Item name="spent" label="Đã chi (VNĐ)">
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

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Title level={5} style={{ margin: 0 }}><UsergroupAddOutlined /> Khách hàng mục tiêu</Title>
              <Tag color="blue">{selectedCustomerIds.length} đã chọn</Tag>
            </div>

            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn khách hàng mục tiêu"
              value={selectedCustomerIds}
              onChange={setSelectedCustomerIds}
              optionFilterProp="children"
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={customers.map(c => ({
                label: `${c.name} (${c.segment || 'Thường'})`,
                value: c.id
              }))}
            />
          </div>

          <div style={{ marginTop: 24 }}>
            <Title level={5}><TrophyOutlined /> Hiệu quả chiến dịch</Title>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="actualRevenue" label="Doanh thu thực tế (VNĐ)">
                  <InputNumber
                    style={{ width: "100%" }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        </Form>
      </Modal >
    </div >
  );
}
