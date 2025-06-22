import 'antd/dist/reset.css';
import React, { useState, useEffect } from "react";
import { NavigateFunction, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Modal, Divider, message} from 'antd';
import { LoginOutlined, UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { login, loginWithGoogle, handleOAuthCallback } from "../services/auth.service";

  const Login: React.FC = () => {
    let navigate: NavigateFunction = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState<boolean>(false);
    const [messageText, setMessageText] = useState<string>("");
    const [isShow, setIsShow] = React.useState(false); 

    // Handle OAuth callback
    useEffect(() => {
      const urlParams = new URLSearchParams(location.search);
      const token = urlParams.get('token');
      const error = urlParams.get('error');
      
      if (token) {
        // Handle successful OAuth login
        handleOAuthCallback(token)
          .then(() => {
            message.success('Successfully logged in with Google!');
            navigate("/profile");
            window.location.reload();
          })
          .catch((error) => {
            message.error('OAuth login failed. Please try again.');
            console.error('OAuth callback error:', error);
          });
      } else if (error === 'oauth_failed') {
        message.error('Google login failed. Please try again.');
      }
    }, [location, navigate]);

    const onFinish = (values:any) => {
    const { username, password } =values;

 
      
    setMessageText("");
    setLoading(true);

    login(username, password).then(
      () => {
        if(localStorage.getItem("user"))
          navigate("/profile");
        window.location.reload();
      })
      .catch( 
       (error)  => {

        const resMessage =
          (error.response &&
            error.response.data &&
            error.response.data.message) ||
          error.message ||
          error.toString();
        window.alert(`Sorry ${username} you may not have account in our system yet! pls try again or register first`)
        console.log(error.toString());     
        setLoading(false);
        setMessageText(resMessage);
         navigate("/");
         window.location.reload();

      }

    )

    }

    const handleGoogleLogin = () => {
      setLoading(true);
      loginWithGoogle();
    };

  return (
    <>
      <Button icon={<LoginOutlined />} onClick={()=>{setIsShow(true)}} />
      <Modal open={isShow} onCancel={()=>{setIsShow(false)}} title="Welcome to Hotel Agent" footer={[]}> 
    <Form style={{margin: "5px"}} 
      name="normal_login"
      layout="vertical"
      wrapperCol={{span:10}}
  className="login-form"
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        label="Username"
        rules={[
          {
            required: true,
            message: 'Please input your Username!',
          },
        ]}
      >
        <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
      </Form.Item>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          {
            required: true,
            message: 'Please input your Password!',
          },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="Password"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>Remember me</Checkbox>
        </Form.Item>

        <a className="login-form-forgot" href="">
          Forgot password
        </a>
      </Form.Item>

      <Form.Item>
        <Button 
          type="primary" 
          htmlType="submit" 
          className="login-form-button"
          loading={loading}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          Log in
        </Button>
        
        <Divider>or</Divider>
        
        <Button 
          icon={<GoogleOutlined />}
          onClick={handleGoogleLogin}
          loading={loading}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          Continue with Google
        </Button>
        
        <div style={{ textAlign: 'center' }}>
          <a href="/register">Or register now!</a>
        </div>
      </Form.Item>
    </Form>
        </Modal>
    </>  
  );
};


export default Login;

