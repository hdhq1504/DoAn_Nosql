import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Descriptions,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Divider,
  Tag,
  Space,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  EditOutlined,
  CameraOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import "./Profile.css";

const { Title, Text } = Typography;

export default function Profile() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [form] = Form.useForm();

  const [userInfo, setUserInfo] = useState({
    name: "Admin",
    email: "admin@crm.com",
    phone: "+84 123 456 789",
    role: "Quản trị viên",
    department: "Quản lý",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    joinDate: "01/01/2023",
    avatar: "https://randomuser.me/api/portraits/men/75.jpg",
    bio: "Quản trị viên hệ thống CRM với hơn 5 năm kinh nghiệm trong lĩnh vực quản lý khách hàng và phát triển kinh doanh.",
  });

  const handleEditProfile = () => {
    form.setFieldsValue(userInfo);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    form.validateFields().then((values) => {
      setUserInfo({ ...userInfo, ...values });
      setIsEditModalOpen(false);
      message.success("Cập nhật thông tin thành công!");
    });
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    form.resetFields();
  };

  const uploadProps = {
    name: "avatar",
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ được tải lên file ảnh!");
      }
      return false; // Prevent auto upload
    },
  };

  return (
    <div className="profile-page-modern">
      <Title level={2}>Hồ sơ cá nhân</Title>

      <Row gutter={[24, 24]}>
        {/* Left Column - Profile Card */}
        <Col xs={24} lg={8}>
          <Card className="profile-card">
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <Avatar size={120} src={userInfo.avatar} icon={<UserOutlined />} />
                <div className="avatar-upload-overlay">
                  <Upload {...uploadProps}>
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="large"
                    />
                  </Upload>
                </div>
              </div>
              <Title level={3} style={{ marginTop: 16, marginBottom: 4 }}>
                {userInfo.name}
              </Title>
              <Tag color="blue" style={{ fontSize: 14 }}>
                {userInfo.role}
              </Tag>
              <Text type="secondary" style={{ marginTop: 12, display: "block" }}>
                {userInfo.bio}
              </Text>
            </div>

            <Divider />

            <div className="profile-stats">
              <Row gutter={16}>
                <Col span={12}>
                  <div className="stat-item">
                    <Text strong style={{ fontSize: 24, color: "#1890ff" }}>
                      2,847
                    </Text>
                    <Text type="secondary">Khách hàng</Text>
                  </div>
                </Col>
                <Col span={12}>
                  <div className="stat-item">
                    <Text strong style={{ fontSize: 24, color: "#52c41a" }}>
                      156
                    </Text>
                    <Text type="secondary">Hợp đồng</Text>
                  </div>
                </Col>
              </Row>
            </div>

            <Divider />

            <Button
              type="primary"
              icon={<EditOutlined />}
              block
              size="large"
              onClick={handleEditProfile}
            >
              Chỉnh sửa hồ sơ
            </Button>
          </Card>
        </Col>

        {/* Right Column - Details */}
        <Col xs={24} lg={16}>
          <Card title="Thông tin chi tiết" className="details-card">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered>
              <Descriptions.Item
                label={
                  <Space>
                    <UserOutlined />
                    Họ và tên
                  </Space>
                }
                span={2}
              >
                {userInfo.name}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <MailOutlined />
                    Email
                  </Space>
                }
              >
                {userInfo.email}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <PhoneOutlined />
                    Số điện thoại
                  </Space>
                }
              >
                {userInfo.phone}
              </Descriptions.Item>

              <Descriptions.Item label="Phòng ban">
                {userInfo.department}
              </Descriptions.Item>

              <Descriptions.Item label="Chức vụ">
                <Tag color="blue">{userInfo.role}</Tag>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <Space>
                    <EnvironmentOutlined />
                    Địa chỉ
                  </Space>
                }
                span={2}
              >
                {userInfo.address}
              </Descriptions.Item>

              <Descriptions.Item label="Ngày tham gia" span={2}>
                {userInfo.joinDate}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card
            title="Hoạt động gần đây"
            style={{ marginTop: 24 }}
            className="activity-card"
          >
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-dot" style={{ background: "#52c41a" }} />
                <div className="activity-content">
                  <Text strong>Thêm khách hàng mới</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Nguyễn Văn An - 2 giờ trước
                  </Text>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: "#1890ff" }} />
                <div className="activity-content">
                  <Text strong>Cập nhật chiến dịch</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Chiến dịch Q4 2024 - 5 giờ trước
                  </Text>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: "#faad14" }} />
                <div className="activity-content">
                  <Text strong>Hoàn thành công việc</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Gọi điện tư vấn - 1 ngày trước
                  </Text>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-dot" style={{ background: "#722ed1" }} />
                <div className="activity-content">
                  <Text strong>Tạo báo cáo</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    Báo cáo KPI tháng 11 - 2 ngày trước
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa hồ sơ"
        open={isEditModalOpen}
        onOk={handleSaveProfile}
        onCancel={handleCancelEdit}
        width={600}
        okText={
          <Space>
            <SaveOutlined />
            Lưu thay đổi
          </Space>
        }
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Họ và tên"
            rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
          >
            <Input prefix={<UserOutlined />} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="department" label="Phòng ban">
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="role" label="Chức vụ">
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="address" label="Địa chỉ">
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item name="bio" label="Giới thiệu">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
