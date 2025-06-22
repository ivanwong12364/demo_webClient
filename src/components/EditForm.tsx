import 'antd/dist/reset.css';
import React, { useState } from "react";
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Modal, Typography, message, Upload } from 'antd';
import { EditOutlined, UploadOutlined } from '@ant-design/icons';
import axios from "axios";
import { api } from './common/http-common';
import { getCurrentUser } from "../services/auth.service";
import OAuth from 'oauth-1.0a';
import CryptoJS from 'crypto-js';

const { Title } = Typography;
const { TextArea } = Input;

interface HotelFormValues {
  title: string;
  alltext: string;
  summary: string;
  description: string;
  imageurl: string;
}

const EditForm: React.FC<{ isNew: boolean; aid?: string }> = (props) => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const aa: any = JSON.parse(localStorage.getItem('e') || "{}");
  const [form] = Form.useForm();

  // Twitter configuration - Use environment variables in production
  const twitterConfig = {
    apiKey: 'dwrTLXN2JBO54lIwrToZl8pCI',
    apiSecret: '4KFmzo6unNht80MqyiCBgy7rZKwX6FW6eOC2h3b8ug6iQPy206',
    accessToken: '806100229686603776-g65XMMI7kdwoCB4b92hT2jqHzxSzkuX',
    accessSecret: 'RvVzPa2Zidtai5if7TuWqVXIKe06nOopCOUbniTceHmNb'
  };

  const contentRules = [
    { required: true, message: 'Please input something' },
    { type: 'string', message: 'This field must be a string' }
  ];

  const oauth = OAuth({
    consumer: {
      key: twitterConfig.apiKey,
      secret: twitterConfig.apiSecret
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string: string, key: string) {
      return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
    },
  });

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Image must be smaller than 5MB!');
      return false;
    }
    return true;
  };

  const handleImageChange = (info: any) => {
    if (info.file.status === 'done') {
      setImageFile(info.file.originFileObj);
    }
  };

  const uploadMediaToTwitter = async (file: File): Promise<string | undefined> => {
    const token = {
      key: twitterConfig.accessToken,
      secret: twitterConfig.accessSecret
    };

    const initUrl = 'https://upload.twitter.com/1.1/media/upload.json?command=INIT&media_type=image/jpeg&total_bytes=' + file.size;
    const initAuth = oauth.toHeader(oauth.authorize({
      url: initUrl,
      method: 'POST'
    }, token));

    try {
      const initResponse = await axios.post(initUrl, {}, {
        headers: {
          ...initAuth,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      const mediaId = initResponse.data.media_id_string;

      const appendUrl = 'https://upload.twitter.com/1.1/media/upload.json?command=APPEND&media_id=' + mediaId + '&segment_index=0';
      const appendAuth = oauth.toHeader(oauth.authorize({
        url: appendUrl,
        method: 'POST'
      }, token));

      const formData = new FormData();
      formData.append('media', file);

      await axios.post(appendUrl, formData, {
        headers: {
          ...appendAuth,
          'Content-Type': 'multipart/form-data'
        }
      });

      const finalizeUrl = 'https://upload.twitter.com/1.1/media/upload.json?command=FINALIZE&media_id=' + mediaId;
      const finalizeAuth = oauth.toHeader(oauth.authorize({
        url: finalizeUrl,
        method: 'POST'
      }, token));

      await axios.post(finalizeUrl, {}, {
        headers: {
          ...finalizeAuth,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return mediaId;
    } catch (error) {
      console.error("Media upload failed:", error);
      return undefined;
    }
  };

  const postToTwitter = async (text: string, imageFile?: File) => {
    const url = 'https://api.twitter.com/2/tweets';
    const token = {
      key: twitterConfig.accessToken,
      secret: twitterConfig.accessSecret
    };

    let mediaId: string | undefined;
    if (imageFile) {
      mediaId = await uploadMediaToTwitter(imageFile);
    }

    const requestData = {
      url,
      method: 'POST',
      data: {
        text: text.length > 280 ? text.substring(0, 277) + "..." : text,
        ...(mediaId ? { media: { media_ids: [mediaId] } } : {})
      }
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    try {
      const response = await axios.post(url, requestData.data, {
        headers: {
          ...authHeader,
          'Content-Type': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("Twitter API Error:", error);
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
      window.open(tweetUrl, '_blank');
      return { fallback: true, message: "Opened Twitter compose window as fallback" };
    }
  };

  const handleFormSubmit = async (values: HotelFormValues) => {
    setLoading(true);
    const currentUser = getCurrentUser();
    const token = localStorage.getItem('aToken');

    // Detailed logging for debugging
    console.log("API base URI:", api.uri);
    console.log("Current user:", currentUser);
    console.log("Token in localStorage:", token ? "Present" : "Missing");
    console.log("Hotel data from localStorage:", aa);
    console.log("Props:", { isNew: props.isNew, aid: props.aid });

    // Validate authentication
    if (!currentUser) {
      message.error("No user data found. Please log in.");
      console.log("Authentication failed: getCurrentUser returned null");
      setLoading(false);
      navigate("/login");
      return;
    }

    if (!currentUser.id || !currentUser.role) {
      message.error("User data incomplete. Please log in again.");
      console.log("Authentication failed: Missing user ID or role", currentUser);
      setLoading(false);
      navigate("/login");
      return;
    }

    if (!token) {
      message.error("Authentication token missing. Please log in again.");
      console.log("Authentication failed: No token in localStorage");
      setLoading(false);
      navigate("/login");
      return;
    }

    if (currentUser.role !== "admin") {
      message.error("Only admin users can update hotels.");
      console.log("Authorization failed: User role is", currentUser.role);
      setLoading(false);
      return;
    }

    // Ensure all fields are strings and use agencyid
    const postHotel = {
      title: String(values.title || ''),
      alltext: String(values.alltext || ''),
      summary: String(values.summary || ''),
      description: String(values.description || ''),
      imageurl: String(values.imageurl || ''),
      agencyid: Number(currentUser.id)
    };

    // Log payload and headers
    console.log("Submitting hotel data:", postHotel);
    console.log("Authorization header:", `Basic ${token}`);

    try {
      if (props.isNew === false) {
        // Verify user is authorized to update this hotel
        if (aa.agencyid && Number(aa.agencyid) !== Number(currentUser.id)) {
          message.error("You are not authorized to update this hotel.");
          console.log("Authorization failed: User ID", currentUser.id, "does not match hotel agencyid", aa.agencyid);
          setLoading(false);
          return;
        }

        await axios.put(`${api.uri}/hotels/${props.aid}`, postHotel, {
          headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json'
          }
        });
        message.success("Hotel updated successfully");
        localStorage.removeItem("e");
      } else {
        await axios.post(`${api.uri}/hotels`, postHotel, {
          headers: {
            'Authorization': `Basic ${token}`,
            'Content-Type': 'application/json'
          }
        });
        message.success("New Hotel created successfully");

        const tweetText = `New hotel listing live! Check out "${values.title.substring(0, 50)}..." #NewHotel #Travel`;
        const twitterResult = await postToTwitter(tweetText, imageFile);

        if (twitterResult?.fallback) {
          message.info(twitterResult.message);
        } else {
          message.success("Posted to Twitter successfully!");
          if (twitterResult.data?.id) {
            window.open(
              `https://twitter.com/${twitterConfig.accessToken.split('-')[0]}/status/${twitterResult.data.id}`,
              '_blank'
            );
          }
        }
      }

      navigate("/");
      window.location.reload();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const errorMessage = error.response?.data?.message || "Failed to complete operation";
      console.log("Server response:", error.response?.data);
      console.log("Response status:", error.response?.status);
      console.log("Response headers:", error.response?.headers);
      if (error.response?.status === 401 || error.response?.status === 403) {
        message.error("Unauthorized: Invalid token or insufficient permissions. Please log in again.");
        localStorage.removeItem('aToken');
        navigate("/login");
      } else {
        message.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button icon={<EditOutlined />} onClick={() => setIsShow(true)} />
      <Modal 
        open={isShow} 
        onCancel={() => {
          setIsShow(false);
          form.resetFields();
          setImageFile(null);
        }}
        title="Hotel Agent Admin Page" 
        footer={[]}
        destroyOnClose
        width={800}
      >
        <p></p>
        {props.isNew ? (
          <Title level={3} style={{ color: "#0032b3" }}>Create New Hotel Info</Title>
        ) : (
          <Title level={3} style={{ color: "#0032b3" }}>Update Hotel</Title>
        )}
        <Form 
          form={form}
          name="hotel"
          onFinish={handleFormSubmit}
          initialValues={props.isNew ? undefined : aa}
          layout="vertical"
        >
          <Form.Item name="title" label="Hotel Name" rules={contentRules}>
            <Input placeholder="Enter hotel name" />
          </Form.Item>
          <Form.Item name="alltext" label="About the Hotel" rules={contentRules}>
            <TextArea rows={4} placeholder="Describe the hotel" />
          </Form.Item>
          <Form.Item name="summary" label="Summary" rules={[{ type: 'string' }]}>
            <TextArea rows={2} placeholder="Short summary" />
          </Form.Item>
          <Form.Item name="description" label="Detailed Description" rules={[{ type: 'string' }]}>
            <TextArea rows={4} placeholder="Detailed description" />
          </Form.Item>
          <Form.Item name="imageurl" label="Image URL" rules={[{ type: 'string' }]}>
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          <Form.Item label="Upload Image for Twitter">
            <Upload
              name="image"
              listType="picture"
              beforeUpload={beforeUpload}
              onChange={handleImageChange}
              showUploadList={true}
              maxCount={1}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={loading}
              size="large"
              block
            >
              {props.isNew ? "Create Hotel" : "Update Hotel"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default EditForm;