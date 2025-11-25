import React, { useState, useEffect, useReducer } from "react";
import {
  Table,
  Button,
  Modal,
  Drawer,
  Tabs,
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
  Timeline,
  Steps,
  message,
  Tooltip,
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
  FileTextOutlined,
  CheckCircleOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { customerAPI, contractAPI } from "../../services/api";
import "./Customers.css";
import dayjs from "dayjs";

const { Title } = Typography;
const { Option } = Select;

const detailInitialState = {
  selectedCustomer: null,
  isDrawerOpen: false,
  detailLoadingId: null,
  interactions: [],
  contracts: [],
  journey: [],
  interactionsLoading: false,
  contractsLoading: false,
  journeyLoading: false,
  interactionsError: null,
  contractsError: null,
  journeyError: null,
  interactionType: "all",
  interactionDateRange: null,
};

function detailReducer(state, action) {
  switch (action.type) {
    case "OPEN_DRAWER":
      return {
        ...state,
        selectedCustomer: action.customer,
        isDrawerOpen: true,
        detailLoadingId: action.customer?.id || null,
        interactionType: "all",
        interactionDateRange: null,
        interactionsError: null,
        journeyError: null,
      };
    case "CLOSE_DRAWER":
      return { ...detailInitialState };
    case "SET_INTERACTIONS_LOADING":
      return { ...state, interactionsLoading: true, interactionsError: null };
    case "SET_INTERACTIONS_SUCCESS":
      return {
        ...state,
        interactionsLoading: false,
        interactions: action.data,
      };
    case "SET_INTERACTIONS_ERROR":
      return {
        ...state,
        interactionsLoading: false,
        interactionsError: action.error,
      };
    case "SET_CONTRACTS_LOADING":
      return { ...state, contractsLoading: true, contractsError: null };
    case "SET_CONTRACTS_SUCCESS":
      return { ...state, contractsLoading: false, contracts: action.data };
    case "SET_CONTRACTS_ERROR":
      return {
        ...state,
        contractsLoading: false,
        contractsError: action.error,
      };
    case "SET_JOURNEY_LOADING":
      return { ...state, journeyLoading: true, journeyError: null };
    case "SET_JOURNEY_SUCCESS":
      return { ...state, journeyLoading: false, journey: action.data };
    case "SET_JOURNEY_ERROR":
      return { ...state, journeyLoading: false, journeyError: action.error };
    case "FINISH_DETAIL_LOADING":
      return { ...state, detailLoadingId: null };
    case "SET_INTERACTION_TYPE":
      return { ...state, interactionType: action.value };
    case "SET_INTERACTION_DATE_RANGE":
      return { ...state, interactionDateRange: action.value };
    default:
      return state;
  }
}

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [detailState, dispatchDetail] = useReducer(
    detailReducer,
    detailInitialState
  );

  const [searchText, setSearchText] = useState("");
  const [filterSegment, setFilterSegment] = useState("all");
  const [filterRegion, setFilterRegion] = useState("all");
  const [filterPotential, setFilterPotential] = useState("all");

  const [form] = Form.useForm();

  const {
    selectedCustomer,
    isDrawerOpen,
    detailLoadingId,
    interactions,
    contracts,
    journey,
    interactionsLoading,
    contractsLoading,
    journeyLoading,
    interactionsError,
    contractsError,
    journeyError,
    interactionType,
    interactionDateRange,
  } = detailState;

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

  const stats = {
    total: customers.length,
    vip: customers.filter((c) => c.segment === "VIP").length,
    business: customers.filter((c) => c.segment === "Doanh nghiệp").length,
    new: customers.filter((c) => {
      const created = new Date(c.createddate);
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return created > monthAgo;
    }).length,
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.phone?.includes(searchText);

    const matchesSegment =
      filterSegment === "all" || customer.segment === filterSegment;

    const matchesRegion =
      filterRegion === "all" ||
      (customer.address && customer.address.includes(filterRegion));

    const matchesPotential =
      filterPotential === "all" ||
      (filterPotential === "High"
        ? customer.lifetimevalue > 10000000
        : customer.lifetimevalue <= 10000000);

    return matchesSearch && matchesSegment && matchesRegion && matchesPotential;
  });

  const interactionTypes = [
    "all",
    ...new Set(interactions.map((item) => item.type).filter(Boolean)),
  ];

  const filteredInteractions = interactions.filter((item) => {
    const matchesType =
      interactionType === "all" || item.type === interactionType;
    const matchesDate = interactionDateRange
      ? (() => {
        const date = dayjs(item.date);
        const start = interactionDateRange[0].startOf("day");
        const end = interactionDateRange[1].endOf("day");
        return !date.isBefore(start) && !date.isAfter(end);
      })()
      : true;
    return matchesType && matchesDate;
  });

  const currentJourneyStep = Math.max(
    journey.findIndex(
      (step) => step.status === "Current" || step.status === "In Progress"
    ),
    0
  );

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      ...customer,
      createddate: customer.createddate ? dayjs(customer.createddate) : null,
      lastcontact: customer.lastcontact ? dayjs(customer.lastcontact) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await customerAPI.delete(id);
      message.success("Xóa khách hàng thành công");
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
      message.error("Lỗi khi xóa khách hàng");
    }
  };

  const fetchInteractions = async (customerId) => {
    try {
      dispatchDetail({ type: "SET_INTERACTIONS_LOADING" });
      const response = await customerAPI.getInteractions(customerId);
      dispatchDetail({
        type: "SET_INTERACTIONS_SUCCESS",
        data: response.data || [],
      });
    } catch (err) {
      dispatchDetail({
        type: "SET_INTERACTIONS_ERROR",
        error: "Không thể tải lịch sử tương tác",
      });
    }
  };

  const fetchContracts = async (customerId) => {
    try {
      dispatchDetail({ type: "SET_CONTRACTS_LOADING" });
      const response = await contractAPI.getAll({ customerId });
      dispatchDetail({
        type: "SET_CONTRACTS_SUCCESS",
        data: response.data || [],
      });
    } catch (err) {
      dispatchDetail({
        type: "SET_CONTRACTS_ERROR",
        error: "Không thể tải lịch sử hợp đồng",
      });
    }
  };

  const fetchJourney = async (customerId) => {
    try {
      dispatchDetail({ type: "SET_JOURNEY_LOADING" });
      const response = await customerAPI.getJourney(customerId);
      dispatchDetail({
        type: "SET_JOURNEY_SUCCESS",
        data: response.data || [],
      });
    } catch (err) {
      dispatchDetail({
        type: "SET_JOURNEY_ERROR",
        error: "Không thể tải hành trình khách hàng",
      });
    }
  };

  const handleViewDetails = async (customer) => {
    dispatchDetail({ type: "OPEN_DRAWER", customer });
    await Promise.all([
      fetchInteractions(customer.id),
      fetchContracts(customer.id),
      fetchJourney(customer.id),
    ]);
    dispatchDetail({ type: "FINISH_DETAIL_LOADING" });
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
        status: values.status || "Active",
        satisfactionScore: values.satisfactionScore || 0,
        lifetimevalue: values.lifetimevalue || 0,
        createddate: values.createddate
          ? values.createddate.toISOString()
          : editingCustomer?.createddate || new Date().toISOString(),
        lastcontact: values.lastcontact
          ? values.lastcontact.toISOString()
          : editingCustomer?.lastcontact || new Date().toISOString(),
      };

      if (editingCustomer) {
        await customerAPI.update(editingCustomer.id, formattedValues);
        message.success("Cập nhật khách hàng thành công");
      } else {
        const newCustomer = {
          id: `C${Date.now()}`,
          ...formattedValues,
        };
        await customerAPI.create(newCustomer);
        message.success("Thêm khách hàng thành công");
      }

      setIsModalOpen(false);
      form.resetFields();
      fetchCustomers();
    } catch (err) {
      console.error("Error saving customer:", err);
      message.error("Lỗi khi lưu khách hàng");
    }
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "8%",
      sorter: (a, b) => (a.id || "").localeCompare(b.id || ""),
    },
    {
      title: "Khách hàng",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{text}</div>
          <div style={{ fontSize: 12, color: "#8c8c8c" }}>{record.company || "-"}</div>
        </div>
      ),
    },
    {
      title: "Liên hệ",
      key: "contact",
      width: "20%",
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
      title: "Phân khúc",
      dataIndex: "segment",
      key: "segment",
      width: "12%",
      render: (segment) => {
        let color = "blue";
        if (segment === "VIP") color = "purple";
        else if (segment === "Doanh nghiệp") color = "green";
        return <Tag color={color}>{segment}</Tag>;
      },
    },
    {
      title: "Địa chỉ",
      dataIndex: "address",
      key: "address",
      width: "15%",
      ellipsis: true,
    },
    {
      title: "Giá trị",
      dataIndex: "lifetimevalue",
      key: "lifetimevalue",
      width: "12%",
      align: "right",
      render: (value) => `₫${Number(value || 0).toLocaleString("vi-VN")}`,
      sorter: (a, b) => (a.lifetimevalue || 0) - (b.lifetimevalue || 0),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: "12%",
      align: "right",
      render: (value) => <Tag color={value === "Active" ? "green" : "red"}>{value}</Tag>,
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: "10%",
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Xem chi tiết & Hành trình">
            <Button
              type="text"
              icon={<EyeOutlined style={{ color: "#1890ff" }} />}
              onClick={() => handleViewDetails(record)}
              loading={
                detailLoadingId === record.id &&
                (interactionsLoading || journeyLoading)
              }
            />
          </Tooltip>
          <Tooltip title="Chỉnh sửa">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Xóa khách hàng"
            description="Bạn có chắc muốn xóa khách hàng này?"
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

  return (
    <div className="customers-page">
      <div className="customers-page__header">
        <Title level={2} className="customers-page__title">
          Quản lý Khách hàng
        </Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Thêm khách hàng
        </Button>
      </div>

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

      <Row gutter={[16, 16]} className="customers-page__stats">
        <Col xs={24} sm={12} lg={6}>
          <Card className="customers-page__stat-card">
            <Statistic
              title="Tổng khách hàng"
              value={stats.total}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="customers-page__stat-card">
            <Statistic
              title="VIP"
              value={stats.vip}
              prefix={<CrownOutlined />}
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="customers-page__stat-card">
            <Statistic
              title="Doanh nhân"
              value={stats.business}
              prefix={<ShopOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="customers-page__stat-card">
            <Statistic
              title="Khách hàng mới"
              value={stats.new}
              prefix={<UserAddOutlined />}
              valueStyle={{ color: "#fa8c16" }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="customers-page__toolbar">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Input
              placeholder="Tìm kiếm theo tên, email, sđt..."
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} md={5}>
            <Select
              value={filterSegment}
              onChange={setFilterSegment}
              style={{ width: "100%" }}
            >
              <Option value="all">Tất cả phân khúc</Option>
              <Option value="VIP">VIP</Option>
              <Option value="Doanh nghiệp">Doanh nghiệp</Option>
              <Option value="Thường">Thường</Option>
            </Select>
          </Col>
          <Col xs={24} md={5}>
            <Select
              value={filterRegion}
              onChange={setFilterRegion}
              style={{ width: "100%" }}
              placeholder="Lọc theo khu vực"
            >
              <Option value="all">Tất cả khu vực</Option>
              <Option value="Hà Nội">Hà Nội</Option>
              <Option value="Hồ Chí Minh">Hồ Chí Minh</Option>
              <Option value="Đà Nẵng">Đà Nẵng</Option>
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              value={filterPotential}
              onChange={setFilterPotential}
              style={{ width: "100%" }}
              placeholder="Mức độ tiềm năng"
            >
              <Option value="all">Tất cả mức độ</Option>
              <Option value="High">Tiềm năng cao ({">"} 10tr)</Option>
              <Option value="Low">Tiềm năng thấp ({"<="} 10tr)</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      <Drawer
        title={`Hồ sơ khách hàng${selectedCustomer ? `: ${selectedCustomer.name}` : ""
          }`}
        width={800}
        onClose={() => dispatchDetail({ type: "CLOSE_DRAWER" })}
        open={isDrawerOpen}
        destroyOnClose
      >
        {selectedCustomer && (
          <>
            <Row gutter={[16, 16]} className="customers-page__drawer-info">
              <Col span={12}>
                <Card size="small" bordered={false} style={{ background: "#fafafa" }}>
                  <div style={{ fontWeight: 600 }}>
                    {selectedCustomer.company || "Khách lẻ"}
                  </div>
                  <div style={{ color: "#8c8c8c" }}>{selectedCustomer.email}</div>
                  <div style={{ color: "#8c8c8c" }}>{selectedCustomer.phone}</div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" bordered={false} style={{ background: "#fafafa" }}>
                  <Space>
                    <Tag color="blue">{selectedCustomer.segment}</Tag>
                    <Tag>{selectedCustomer.type}</Tag>
                  </Space>
                  <div style={{ color: "#8c8c8c", marginTop: 4 }}>
                    Ngày tạo:{" "}
                    {selectedCustomer.createddate
                      ? dayjs(selectedCustomer.createddate).format("DD/MM/YYYY")
                      : "-"}
                  </div>
                </Card>
              </Col>
            </Row>

            <Tabs
              defaultActiveKey="interactions"
              items={[
                {
                  key: "interactions",
                  label: "Lịch sử tương tác",
                  children: (
                    <>
                      <Space style={{ marginBottom: 12 }} wrap>
                        <DatePicker.RangePicker
                          value={interactionDateRange}
                          onChange={(value) =>
                            dispatchDetail({
                              type: "SET_INTERACTION_DATE_RANGE",
                              value,
                            })
                          }
                          format="DD/MM/YYYY"
                        />
                        <Select
                          value={interactionType}
                          onChange={(value) =>
                            dispatchDetail({
                              type: "SET_INTERACTION_TYPE",
                              value,
                            })
                          }
                          style={{ minWidth: 160 }}
                        >
                          {interactionTypes.map((type) => (
                            <Option key={type} value={type}>
                              {type === "all" ? "Tất cả loại" : type}
                            </Option>
                          ))}
                        </Select>
                      </Space>

                      {interactionsError && (
                        <Alert
                          message="Lỗi"
                          description={interactionsError}
                          type="error"
                          showIcon
                          style={{ marginBottom: 12 }}
                        />
                      )}

                      <Spin spinning={interactionsLoading}>
                        {filteredInteractions.length === 0 ? (
                          <Alert
                            message="Không có dữ liệu tương tác"
                            type="info"
                            showIcon
                          />
                        ) : (
                          <Timeline
                            mode="left"
                            items={filteredInteractions.map((item) => ({
                              color:
                                item.type === "Email"
                                  ? "blue"
                                  : item.type === "Call"
                                    ? "green"
                                    : "gray",
                              label: item.date
                                ? dayjs(item.date).format("DD/MM/YYYY")
                                : "-",
                              children: (
                                <div>
                                  <strong>{item.type || "Tương tác"}</strong>
                                  <div style={{ color: "#8c8c8c" }}>
                                    {item.notes ||
                                      item.description ||
                                      "Không có ghi chú"}
                                  </div>
                                </div>
                              ),
                            }))}
                          />
                        )}
                      </Spin>
                    </>
                  ),
                },
                {
                  key: "contracts",
                  label: "Lịch sử hợp đồng",
                  icon: <FileTextOutlined />,
                  children: (
                    <>
                      {contractsError && (
                        <Alert
                          message="Lỗi"
                          description={contractsError}
                          type="error"
                          showIcon
                          style={{ marginBottom: 12 }}
                        />
                      )}
                      <Spin spinning={contractsLoading}>
                        {contracts.length === 0 ? (
                          <Alert
                            message="Chưa có hợp đồng nào"
                            type="info"
                            showIcon
                          />
                        ) : (
                          <Table
                            dataSource={contracts}
                            rowKey="id"
                            pagination={false}
                            columns={[
                              { title: "Mã HĐ", dataIndex: "id", key: "id" },
                              {
                                title: "Ngày mua",
                                dataIndex: "purchaseDate",
                                key: "purchaseDate",
                                render: (date) =>
                                  date ? dayjs(date).format("DD/MM/YYYY") : "-",
                              },
                              {
                                title: "Giá trị",
                                dataIndex: "contractValue",
                                key: "contractValue",
                                render: (val) =>
                                  `₫${Number(val).toLocaleString("vi-VN")}`,
                              },
                              {
                                title: "Trạng thái",
                                dataIndex: "status",
                                key: "status",
                                render: (status) => (
                                  <Tag
                                    color={
                                      status === "Active" ? "success" : "default"
                                    }
                                  >
                                    {status === "Active" ? "Hiệu lực" : status}
                                  </Tag>
                                ),
                              },
                            ]}
                          />
                        )}
                      </Spin>
                    </>
                  ),
                },
                {
                  key: "journey",
                  label: "Hành trình khách hàng",
                  children: (
                    <>
                      {journeyError && (
                        <Alert
                          message="Lỗi"
                          description={journeyError}
                          type="error"
                          showIcon
                          style={{ marginBottom: 12 }}
                        />
                      )}
                      <Spin spinning={journeyLoading}>
                        {journey.length === 0 ? (
                          <Alert
                            message="Không có dữ liệu hành trình"
                            type="info"
                            showIcon
                          />
                        ) : (
                          <Steps
                            direction="vertical"
                            current={currentJourneyStep}
                            items={journey.map((step) => ({
                              title: step.stage || step.name || "Bước",
                              status:
                                step.status === "Completed"
                                  ? "finish"
                                  : step.status === "Current"
                                    ? "process"
                                    : "wait",
                              description: (
                                <div style={{ color: "#8c8c8c" }}>
                                  {step.description || step.notes}
                                  {step.updatedAt && (
                                    <div style={{ marginTop: 4 }}>
                                      Cập nhật:{" "}
                                      {dayjs(step.updatedAt).format("DD/MM/YYYY")}
                                    </div>
                                  )}
                                </div>
                              ),
                              icon:
                                step.status === "Completed" ? (
                                  <CheckCircleOutlined />
                                ) : null,
                            }))}
                          />
                        )}
                      </Spin>
                    </>
                  ),
                },
              ]}
            />
          </>
        )}
      </Drawer>

      {/* TABLE */}
      <Card className="customers-page__table-card">
        <Spin spinning={loading}>
          <Table
            className="customers-page__table"
            columns={columns}
            dataSource={filteredCustomers}
            rowKey="id"
            // Đã bỏ scroll props
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} khách hàng`,
            }}
          />
        </Spin>
      </Card>

      {/* MODAL: Đã khôi phục đầy đủ các trường */}
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
              <Form.Item name="company" label="Công ty">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="address" label="Địa chỉ">
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
                  <Option value="Doanh nghiệp">Doanh nghiệp</Option>
                  <Option value="Thường">Thường</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="Active">Hoạt động</Option>
                  <Option value="Inactive">Ngừng hoạt động</Option>
                  <Option value="Potential">Tiềm năng</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="createddate" label="Ngày tạo">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="lifetimevalue" label="Giá trị (₫)">
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
              <Form.Item name="lastcontact" label="Liên hệ cuối">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
