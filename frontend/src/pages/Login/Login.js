import React, { useState } from "react";
import { Form, Input, Button, Checkbox, message, Typography } from "antd";
import { UserOutlined, LockOutlined, SettingFilled } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../services/api";
import "./Login.css";

const { Title, Text } = Typography;

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const response = await authAPI.login({
        email: values.email,
        password: values.password,
      });

      if (response.data) {
        message.success("Đăng nhập thành công!");
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error("Email hoặc mật khẩu không đúng!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-left">
          <div className="login-logo">
            <SettingFilled className="login-logo-icon" />
            <span>Hệ thống quản lý CSKH</span>
          </div>

          <Title level={2} className="login-title">Đăng nhập</Title>
          <Text className="login-subtitle">Đăng nhập để tiếp tục</Text>

          <Form
            name="login"
            className="login-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout="vertical"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập Email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<UserOutlined className="site-form-item-icon" />}
                placeholder="admin@gmail.com"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                placeholder="••••••••••••"
              />
            </Form.Item>

            <div className="login-options">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>

              <Button type="link" className="login-forgot" style={{ padding: 0 }}>
                Quên mật khẩu?
              </Button>
            </div>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>
        </div>

        <div className="login-right">
          <div style={{
            position: 'absolute',
            width: '150%',
            height: '50%',
            background: 'white',
            bottom: '-10%',
            left: '-25%',
            borderRadius: '50%',
            opacity: 0.1,
            transform: 'rotate(-10deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            width: '100px',
            height: '100px',
            background: 'white',
            top: '20%',
            right: '20%',
            borderRadius: '50%',
            opacity: 0.2
          }}></div>
        </div>
      </div>
    </div>
  );
}
