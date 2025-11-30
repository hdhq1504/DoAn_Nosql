import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Avatar,
  Typography,
  Button,
  Form,
  Input,
  Upload,
  message,
  Divider,
  Tag,
  Spin
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  CameraOutlined,
  LockOutlined,
  DeleteOutlined,
  CopyOutlined,
  CheckCircleFilled,
} from "@ant-design/icons";
import axios from "axios";
import "./Profile.css";

const { Title, Text } = Typography;

export default function Profile() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "",
    email: "admin@crm.com",
    phone: "",
    address: "",
    bio: "",
    avatar: "",
    roleId: "",
  });

  const API_URL = "https://localhost:5001/api";

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const email = "admin@crm.vn";
        const response = await axios.get(`${API_URL}/user/${email}`);
        const data = response.data;

        setUserInfo({
          username: data.username || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          bio: data.bio || "",
          avatar: data.avatar || "",
          roleId: data.roleId || "",
        });

        form.setFieldsValue({
          username: data.username,
          email: data.email,
          phone: data.phone,
          address: data.address,
          bio: data.bio,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        message.error("Không thể tải thông tin người dùng");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [form]);

  const handleSaveProfile = async (values) => {
    setLoading(true);
    try {
      const updatedUser = {
        ...userInfo,
        ...values,
      };

      await axios.put(`${API_URL}/user/${userInfo.id}`, updatedUser);
      setUserInfo(updatedUser);
      message.success("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error("Lỗi khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async ({ file }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const avatarUrl = response.data.url;

      setUserInfo((prev) => ({ ...prev, avatar: avatarUrl }));

      await axios.put(`${API_URL}/user/${userInfo.id}`, {
        ...userInfo,
        avatar: avatarUrl,
      });

      message.success("Cập nhật ảnh đại diện thành công!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      message.error("Lỗi khi tải ảnh lên");
    }
  };

  if (loading && !userInfo.email) {
    return (
      <div className="profile-loading">
        <Spin size="large" tip="Đang tải hồ sơ..." />
      </div>
    );
  }

  return (
    <div className="profile-page-modern">
      <div className="profile-header-container">
        <Title level={2} style={{ margin: 0 }}>Hồ sơ cá nhân</Title>
      </div>

      <Row gutter={[32, 32]}>
        <Col xs={24} lg={8}>
          <Card className="profile-card" bordered={false}>
            <div className="profile-avatar-section">
              <div className="avatar-wrapper">
                <Avatar
                  size={120}
                  src={userInfo.avatar}
                  icon={<UserOutlined />}
                  className="profile-avatar"
                />
                <Upload
                  showUploadList={false}
                  customRequest={handleUploadAvatar}
                  accept="image/*"
                >
                  <Button
                    type="primary"
                    shape="circle"
                    icon={<CameraOutlined />}
                    className="avatar-upload-btn"
                  />
                </Upload>
              </div>

              <Title level={4} style={{ marginTop: 16, marginBottom: 4 }}>
                {userInfo.username}
              </Title>
              <Text type="secondary">{userInfo.email}</Text>

              <div style={{ marginTop: 8 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>Đăng nhập lần cuối: 4 minutes ago</Text>
              </div>

              <div className="user-id-box">
                <Text type="secondary" ellipsis style={{ maxWidth: 150 }}>
                  User ID: {userInfo.email}
                </Text>
                <Button
                  type="text"
                  icon={<CopyOutlined />}
                  size="small"
                  onClick={() => {
                    navigator.clipboard.writeText(userInfo.email);
                    message.success("Copied!");
                  }}
                >
                  Sao chép
                </Button>
              </div>
            </div>

            <Divider />

            <div className="profile-actions">
              <div className="action-item">
                <LockOutlined />
                <Text>Đổi mật khẩu</Text>
              </div>
              <div className="action-item delete">
                <DeleteOutlined />
                <Text type="danger">Xóa tài khoản</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <div className="details-section">
            <Title level={4} style={{ marginBottom: 24 }}>Thông tin cá nhân</Title>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSaveProfile}
              requiredMark={false}
            >
              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="username"
                    label="Full Name"
                    rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}
                  >
                    <Input size="large" prefix={<UserOutlined className="field-icon" />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                      { required: true, message: "Vui lòng nhập email" },
                      { type: "email", message: "Email không hợp lệ" },
                    ]}
                  >
                    <Input
                      size="large"
                      prefix={<MailOutlined className="field-icon" />}
                      suffix={<Tag color="success" icon={<CheckCircleFilled />}>Đã xác nhận</Tag>}
                      disabled
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item name="phone" label="Phone Number">
                    <Input size="large" prefix={<PhoneOutlined className="field-icon" />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item name="address" label="Address">
                    <Input size="large" prefix={<EnvironmentOutlined className="field-icon" />} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={24}>
                  <Form.Item name="bio" label="Bio">
                    <Input.TextArea rows={4} showCount maxLength={500} />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <div className="form-actions">
                <Button size="large" className="btn-cancel">
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  className="btn-save"
                >
                  Lưu
                </Button>
              </div>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
}
