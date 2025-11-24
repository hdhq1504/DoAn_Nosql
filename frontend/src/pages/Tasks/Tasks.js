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
  DatePicker,
  Tag,
  Popconfirm,
  Typography,
  Space,
  Statistic,
  Badge,
  Avatar,
  Tooltip,
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
} from "@ant-design/icons";
import { mockTasks } from "../../data/mockData";
import "./Tasks.css";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

export default function Tasks() {
  const [tasks, setTasks] = useState(mockTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form] = Form.useForm();

  // Statistics
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
      icon: <SyncOutlined spin />,
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
      dueDate: task.dueDate ? dayjs(task.dueDate) : null,
      createdDate: task.createdDate ? dayjs(task.createdDate) : null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAdd = () => {
    setEditingTask(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      const formattedValues = {
        ...values,
        dueDate: values.dueDate ? values.dueDate.toISOString() : null,
        createdDate: values.createdDate ? values.createdDate.toISOString() : null,
      };

      if (editingTask) {
        setTasks(
          tasks.map((t) =>
            t.id === editingTask.id ? { ...t, ...formattedValues } : t
          )
        );
      } else {
        const newTask = {
          id: `T${Date.now()}`,
          ...formattedValues,
        };
        setTasks([...tasks, newTask]);
      }

      setIsModalOpen(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalOpen(false);
    form.resetFields();
  };

  return (
    <div className="tasks-page-modern">
      {/* Header */}
      <div className="tasks-header">
        <Title level={2}>Quản lý Công việc</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          size="large"
        >
          Thêm công việc
        </Button>
      </div>

      {/* Statistics */}
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
              prefix={<SyncOutlined spin />}
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

      {/* Kanban Board Title */}
      <div className="kanban-title">
        <Title level={4}>Bảng Kanban</Title>
      </div>

      {/* Kanban Board */}
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
                      return (
                        <Card
                          key={task.id}
                          className="kanban-task-card"
                          size="small"
                          hoverable
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
                              <ClockCircleOutlined style={{ fontSize: 12 }} />
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {task.dueDate
                                  ? dayjs(task.dueDate).format("DD/MM/YYYY")
                                  : "Không có hạn"}
                              </Text>
                            </Space>
                          </div>

                          {task.assignedTo && (
                            <div className="task-assignee">
                              <Tooltip title={task.assignedTo}>
                                <Avatar size={24} icon={<UserOutlined />} />
                              </Tooltip>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {task.assignedTo}
                              </Text>
                            </div>
                          )}

                          {task.relatedCustomer && (
                            <Tag color="blue" className="customer-tag">
                              {task.relatedCustomer}
                            </Tag>
                          )}

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

      {/* Modal */}
      <Modal
        title={editingTask ? "Chỉnh sửa công việc" : "Thêm công việc mới"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
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
                <Input disabled={!!editingTask} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="title"
                label="Tiêu đề"
                rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Mô tả">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái">
                <Select>
                  <Option value="Pending">Chờ xử lý</Option>
                  <Option value="In Progress">Đang thực hiện</Option>
                  <Option value="Completed">Hoàn thành</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="priority" label="Ưu tiên">
                <Select>
                  <Option value="Low">Thấp</Option>
                  <Option value="Medium">Trung bình</Option>
                  <Option value="High">Cao</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="type" label="Loại">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="assignedTo" label="Người phụ trách">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="relatedCustomer" label="Khách hàng liên quan">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="dueDate" label="Ngày hết hạn">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="createdDate" label="Ngày tạo">
                <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
