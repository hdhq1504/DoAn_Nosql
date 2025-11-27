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
  DatePicker,
  Tag,
  Popconfirm,
  Typography,
  Space,
  Statistic,
  Badge,
  Avatar,
  Tooltip,
  message,
  Spin
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { taskAPI, employeeAPI, customerAPI, contractAPI } from "../../services/api";
import "./Tasks.css";
import dayjs from "dayjs";
import { generateNextId } from "../../utils/idGenerator";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("kanban");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [form] = Form.useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, employeesRes, customersRes, contractsRes] = await Promise.all([
        taskAPI.getAll(),
        employeeAPI.getAll(),
        customerAPI.getAll(),
        contractAPI.getAll()
      ]);
      setTasks(tasksRes.data || []);
      setEmployees(employeesRes.data || []);
      setCustomers(customersRes.data || []);
      setContracts(contractsRes.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "Pending").length,
    inProgress: tasks.filter((t) => t.status === "In Progress").length,
    completed: tasks.filter((t) => t.status === "Completed").length,
  };

  const statusColumns = [
    {
      key: "Pending",
      label: "Chờ xử lý",
      icon: <ClockCircleOutlined />,
      color: "#faad14",
      count: stats.pending,
    },
    {
      key: "In Progress",
      label: "Đang thực hiện",
      icon: <SyncOutlined />,
      color: "#1890ff",
      count: stats.inProgress,
    },
    {
      key: "Completed",
      label: "Hoàn thành",
      icon: <CheckCircleOutlined />,
      color: "#52c41a",
      count: stats.completed,
    },
  ];

  const getPriorityConfig = (priority) => {
    const configs = {
      High: { color: "red", text: "Cao" },
      Medium: { color: "orange", text: "Trung bình" },
      Low: { color: "default", text: "Thấp" },
    };
    return configs[priority] || configs.Medium;
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    form.setFieldsValue({
      ...task,
      assignedTo: task.assignedToId,
      relatedCustomer: task.relatedCustomerId,
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      createdDate: task.createddate ? dayjs(task.createddate) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await taskAPI.delete(id);
      message.success("Đã xóa công việc");
      await taskAPI.delete(id);
      message.success("Đã xóa công việc");
      fetchData();
    } catch (error) {
      message.error("Không thể xóa công việc");
    }
  };

  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    const nextId = generateNextId(tasks, "T", 6);
    form.setFieldsValue({ id: nextId, status: "Pending", priority: "Medium" });
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        const formattedValues = {
          ...values,
          dueDate: values.dueDate ? values.dueDate.toISOString() : null,
          createddate: values.createdDate ? values.createdDate.toISOString() : new Date().toISOString(),
          assignedToId: values.assignedTo,
          relatedCustomerId: values.relatedCustomer,
        };

        let taskId = editingTask?.id;

        if (!taskId && !formattedValues.id) {
          formattedValues.id = generateNextId(tasks, "T", 6);
        }

        delete formattedValues.assignedTo;
        delete formattedValues.relatedCustomer;
        delete formattedValues.createdDate;

        if (editingTask) {
          await taskAPI.update(editingTask.id, formattedValues);
          message.success("Đã cập nhật công việc");
        } else {
          await taskAPI.create({
            ...formattedValues,
          });
          message.success("Đã thêm công việc mới");
        }
        setIsModalOpen(false);
        form.resetFields();
        fetchData();
      } catch (error) {
        console.error("Error saving task:", error);
        message.error(error.response?.data?.message || "Có lỗi xảy ra");
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  if (loading) {
    return (
      <div className="tasks-loading">
        <Spin size="large" tip="Đang tải công việc...">
          <div style={{ height: 200 }} />
        </Spin>
      </div>
    );
  }

  return (
    <div className="tasks-page-modern">
      <div className="tasks-header">
        <Title level={2}>Quản lý Công việc</Title>
        <Space>
          <Button
            icon={<BarChartOutlined />}
            onClick={() => setIsStatsOpen(true)}
          >
            Hiệu suất
          </Button>
          <Button
            icon={viewMode === "kanban" ? <UnorderedListOutlined /> : <AppstoreOutlined />}
            onClick={() => setViewMode(viewMode === "kanban" ? "list" : "kanban")}
          >
            {viewMode === "kanban" ? "Danh sách" : "Kanban"}
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            size="large"
          >
            Thêm công việc
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]} className="stats-row">
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-compact">
            <Statistic
              title="Tổng công việc"
              value={stats.total}
              prefix={<ExclamationCircleOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-compact">
            <Statistic
              title="Chờ xử lý"
              value={stats.pending}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: "#faad14", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-compact">
            <Statistic
              title="Đang thực hiện"
              value={stats.inProgress}
              prefix={<SyncOutlined />}
              valueStyle={{ color: "#1890ff", fontSize: 24 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card-compact">
            <Statistic
              title="Hoàn thành"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a", fontSize: 24 }}
            />
          </Card>
        </Col>
      </Row>

      <div className="kanban-title">
        <Title level={4}>Bảng tiến độ công việc</Title>
      </div>

      {
        viewMode === "kanban" ? (
          <div className="kanban-board-container">
            <Row gutter={[16, 16]}>
              {statusColumns.map((column) => (
                <Col xs={24} lg={8} key={column.key}>
                  <div className="kanban-column">
                    <div className="kanban-column-header">
                      <Space>
                        <span style={{ color: column.color, fontSize: 18 }}>
                          {column.icon}
                        </span>
                        <Text strong style={{ fontSize: 15 }}>
                          {column.label}
                        </Text>
                      </Space>
                      <Badge
                        count={column.count}
                        style={{
                          backgroundColor: column.color,
                        }}
                      />
                    </div>

                    <div className="kanban-column-body">
                      {tasks
                        .filter((t) => t.status === column.key)
                        .map((task) => {
                          const priorityConfig = getPriorityConfig(task.priority);
                          const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'Completed';

                          return (
                            <Card
                              key={task.id}
                              className={`kanban-task-card ${isOverdue ? 'task-overdue' : ''}`}
                              size="small"
                              hoverable
                              style={isOverdue ? { borderLeft: '4px solid #ff4d4f' } : {}}
                            >
                              <div className="task-card-header">
                                <Text strong className="task-title">
                                  {task.title}
                                </Text>
                                <Tag color={priorityConfig.color} className="priority-tag">
                                  {priorityConfig.text}
                                </Tag>
                              </div>

                              <Text
                                type="secondary"
                                className="task-description"
                                ellipsis={{ rows: 2 }}
                              >
                                {task.description}
                              </Text>

                              <div className="task-meta">
                                <Space size="small">
                                  <ClockCircleOutlined style={{ fontSize: 12, color: isOverdue ? '#ff4d4f' : 'inherit' }} />
                                  <Text type={isOverdue ? 'danger' : 'secondary'} style={{ fontSize: 12 }}>
                                    {task.dueDate
                                      ? dayjs(task.dueDate).format("DD/MM/YYYY")
                                      : "Không có hạn"}
                                  </Text>
                                </Space>
                              </div>

                              {task.assignedToId && (
                                <div className="task-assignee">
                                  <Tooltip title={employees.find(e => e.id === task.assignedToId)?.name || task.assignedToId}>
                                    <Avatar size={24} icon={<UserOutlined />} />
                                  </Tooltip>
                                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                                    {employees.find(e => e.id === task.assignedToId)?.name || task.assignedToId}
                                  </Text>
                                </div>
                              )}

                              <Space wrap style={{ marginTop: 8 }}>
                                {task.relatedCustomerId && (
                                  <Tag color="blue" className="customer-tag">
                                    {customers.find(c => c.id === task.relatedCustomerId)?.name || task.relatedCustomerId}
                                  </Tag>
                                )}
                                {task.relatedContractId && (
                                  <Tag color="purple">
                                    Mã HĐ: {task.relatedContractId}
                                  </Tag>
                                )}
                              </Space>

                              <div className="task-actions">
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<EditOutlined />}
                                  onClick={() => handleEdit(task)}
                                >
                                  Sửa
                                </Button>
                                <Popconfirm
                                  title="Xóa công việc"
                                  description="Bạn có chắc muốn xóa công việc này?"
                                  onConfirm={() => handleDelete(task.id)}
                                  okText="Xóa"
                                  cancelText="Hủy"
                                  okButtonProps={{ danger: true }}
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                  >
                                    Xóa
                                  </Button>
                                </Popconfirm>
                              </div>
                            </Card>
                          );
                        })}

                      {tasks.filter((t) => t.status === column.key).length === 0 && (
                        <div className="kanban-empty">
                          <Text type="secondary">Không có công việc</Text>
                        </div>
                      )}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        ) : (
          <Card className="task-list-view">
            <div className="task-list-header" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', padding: '12px 16px', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
              <div>Tiêu đề</div>
              <div>Trạng thái</div>
              <div>Ưu tiên</div>
              <div>Người phụ trách</div>
              <div>Hạn chót</div>
              <div style={{ textAlign: 'right' }}>Thao tác</div>
            </div>
            {tasks.map(task => {
              const priorityConfig = getPriorityConfig(task.priority);
              const isOverdue = task.dueDate && dayjs(task.dueDate).isBefore(dayjs(), 'day') && task.status !== 'Completed';
              return (
                <div key={task.id} className="task-list-item" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 100px', padding: '12px 16px', borderBottom: '1px solid #f0f0f0', alignItems: 'center', background: isOverdue ? '#fff1f0' : 'white' }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{task.title}</div>
                    <div style={{ fontSize: 12, color: '#8c8c8c' }}>{task.description}</div>
                  </div>
                  <div>
                    <Tag color={statusColumns.find(c => c.key === task.status)?.color}>
                      {statusColumns.find(c => c.key === task.status)?.label || task.status}
                    </Tag>
                  </div>
                  <div>
                    <Tag color={priorityConfig.color}>{priorityConfig.text}</Tag>
                  </div>
                  <div>
                    {employees.find(e => e.id === task.assignedToId)?.name || task.assignedToId || '-'}
                  </div>
                  <div style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
                    {task.dueDate ? dayjs(task.dueDate).format("DD/MM/YYYY") : "-"}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Space>
                      <Button type="text" icon={<EditOutlined />} onClick={() => handleEdit(task)} />
                      <Popconfirm title="Xóa?" onConfirm={() => handleDelete(task.id)} okText="Xóa" cancelText="Hủy">
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Space>
                  </div>
                </div>
              );
            })}
          </Card>
        )
      }

      {/* Modal */}
      <Modal
        title={editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
        okText="Lưu"
        cancelText="Hủy"
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="id"
                label="Mã công việc"
                hidden
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="type" label="Loại">
                <Select placeholder="Chọn loại công việc">
                  <Option value="Tư vấn">Tư vấn</Option>
                  <Option value="Chăm sóc khách hàng">Chăm sóc khách hàng</Option>
                  <Option value="Gia hạn hợp đồng">Gia hạn hợp đồng</Option>
                  <Option value="Thu phí">Thu phí</Option>
                  <Option value="Xử lý khiếu nại">Xử lý khiếu nại</Option>
                  <Option value="Gọi điện">Gọi điện</Option>
                  <Option value="Họp">Họp</Option>
                  <Option value="Báo cáo">Báo cáo</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Trạng thái"
                rules={[{ required: true, message: "Vui lòng chọn trạng thái" }]}
              >
                <Select>
                  <Option value="Pending">Chờ xử lý</Option>
                  <Option value="In Progress">Đang thực hiện</Option>
                  <Option value="Completed">Hoàn thành</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="priority"
                label="Ưu tiên"
                rules={[{ required: true, message: "Vui lòng chọn mức ưu tiên" }]}
              >
                <Select>
                  <Option value="Low">Thấp</Option>
                  <Option value="Medium">Trung bình</Option>
                  <Option value="High">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="assignedTo"
                label="Người phụ trách"
                rules={[{ required: true, message: "Vui lòng chọn người phụ trách" }]}
              >
                <Select placeholder="Chọn nhân viên">
                  {employees.map(emp => (
                    <Option key={emp.id} value={emp.id}>{emp.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="relatedCustomer" label="Khách hàng liên quan">
                <Select placeholder="Chọn khách hàng">
                  {customers.map(cust => (
                    <Option key={cust.id} value={cust.id}>{cust.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="relatedContractId" label="Hợp đồng liên quan">
                <Select placeholder="Chọn hợp đồng">
                  {contracts.map(cont => (
                    <Option key={cont.id} value={cont.id}>{cont.id} - {dayjs(cont.purchaseDate).format("DD/MM/YYYY")}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="relatedProjectId" label="Dự án liên quan">
                <Input placeholder="Nhập mã dự án" />
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
              <Form.Item
                name="dueDate"
                label="Ngày hết hạn"
                rules={[{ required: true, message: "Vui lòng chọn ngày hết hạn" }]}
              >
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      <Modal
        title="Hiệu suất nhân viên"
        open={isStatsOpen}
        onCancel={() => setIsStatsOpen(false)}
        footer={null}
        width={600}
      >
        <div className="performance-stats">
          {employees.map(emp => {
            const empTasks = tasks.filter(t => t.assignedToId === emp.id);
            const completed = empTasks.filter(t => t.status === "Completed").length;
            const total = empTasks.length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return (
              <div key={emp.id} style={{ marginBottom: 16, padding: 12, border: '1px solid #f0f0f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <strong>{emp.name}</strong>
                  <span>{completed}/{total} hoàn thành</span>
                </div>
                <div style={{ height: 8, background: '#f5f5f5', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${percent}%`, background: percent >= 80 ? '#52c41a' : '#1890ff', height: '100%' }} />
                </div>
              </div>
            );
          })}
        </div>
      </Modal>
    </div >
  );
}
