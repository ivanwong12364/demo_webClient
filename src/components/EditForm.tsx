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
  location: string; // 添加 location 欄位
  price: number;   // 添加 price 欄位
}

const EditForm: React.FC<{ isNew: boolean; aid?: string }> = (props  ) => {
  const navigate: NavigateFunction = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const aa: any = JSON.parse(localStorage.getItem('e') || "{}");
  const [form] = Form.useForm();

  // Twitter configuration - Use environment variables in production
  // 嚴重警告：這些密鑰不應硬編碼在前端！
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

  // 價格的驗證規則
  const priceRules = [
    { required: true, message: 'Please enter the price' },
    {
      validator: (_, value) => {
        if (value === undefined || value === null || value === '') {
          return Promise.resolve();
        }
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return Promise.reject('Price must be a valid number!');
        }
        if (!Number.isInteger(numValue)) { // 確保是整數
          return Promise.reject('Price must be an integer!');
        }
        if (numValue < 0) {
          return Promise.reject('Price cannot be negative!');
        }
        return Promise.resolve();
      },
    },
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

    // Twitter API v1.1 媒體上傳流程
    const initUrl = 'https://upload.twitter.com/1.1/media/upload.json?command=INIT&media_type=image/jpeg&total_bytes=' + file.size;
    const initAuth = oauth.toHeader(oauth.authorize({
      url: initUrl,
      method: 'POST'
    }, token  ));

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
      }, token  ));

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
      }, token  ));

      await axios.post(finalizeUrl, {}, {
        headers: {
          ...finalizeAuth,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      return mediaId;
    } catch (error) {
      console.error("Media upload failed:", error);
      message.error("Failed to upload image to Twitter. Check console for details.");
      return undefined;
    }
  };

  const postToTwitter = async (text: string, imageFile?: File) => {
    // 修正：使用 Twitter API v1.1 的發文端點
    const url = 'https://api.twitter.com/1.1/statuses/update.json';
    const token = {
      key: twitterConfig.accessToken,
      secret: twitterConfig.accessSecret
    };

    let mediaId: string | undefined;
    if (imageFile  ) {
      mediaId = await uploadMediaToTwitter(imageFile);
    }

    // 修正：使用 Twitter API v1.1 的參數名稱 (status, media_ids)
    const requestData = {
      url: url, // OAuth 簽名需要正確的 URL
      method: 'POST',
      data: {
        status: text.length > 280 ? text.substring(0, 277) + "..." : text,
        ...(mediaId ? { media_ids: mediaId } : {}) // v1.1 媒體 ID 參數是單個字串
      }
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    try {
      const response = await axios.post(url, requestData.data, {
        headers: {
          ...authHeader,
          'Content-Type': 'application/x-www-form-urlencoded' // v1.1 通常使用這個 Content-Type
        }
      });
      return response.data;
    } catch (error: any) {
      console.error("Twitter API Error:", error.response?.data || error.message);
      message.error("Failed to post to Twitter. Opening compose window as fallback.");
      // 失敗時的備用方案：打開 Twitter 發文頁面
      const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text  )}`;
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
      location: String(values.location || ''), // 新增 location
      price: parseInt(String(values.price || 0), 10), // 新增 price，確保是整數
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

        // --- 修改這裡以生成更豐富的推文內容 ---
        let tweetContent = `New hotel alert! 🏨`;

        if (values.title) {
          // 限制標題長度，以防過長
          const displayTitle = values.title.length > 40 ? values.title.substring(0, 40) + '...' : values.title;
          tweetContent += ` "${displayTitle}"`;
        }

        if (values.location) {
          tweetContent += ` in ${values.location}`;
        }

        if (values.price) {
          tweetContent += ` from $${values.price}`;
        }

        if (values.summary && values.summary.trim() !== '') {
          // 添加摘要片段，確保不會讓推文過長
          const summarySnippet = values.summary.length > 60 ? values.summary.substring(0, 60) + '...' : values.summary;
          tweetContent += `. ${summarySnippet}`;
        }

        tweetContent += ` #NewHotel #Travel`;

        const tweetText = tweetContent; // 將建構好的內容賦值給 tweetText
        // --- 結束修改 ---

        const twitterResult = await postToTwitter(tweetText, imageFile);

        if (twitterResult?.fallback) {
          message.info(twitterResult.message);
        } else {
          message.success("Posted to Twitter successfully!");
          // 注意：Twitter API v1.1 的回應結構可能不包含 data.id
          // 如果要連結到推文，需要根據實際回應調整
          // if (twitterResult.id_str) { // 假設 v1.1 回應有 id_str
          //   window.open(
          //     `https://twitter.com/${twitterConfig.accessToken.split('-'  )[0]}/status/${twitterResult.id_str}`,
          //     '_blank'
          //   );
          // }
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
          <Form.Item name="summary" label="Short Summary" rules={[{ type: 'string' }]}>
            <TextArea rows={2} placeholder="Short summary" />
          </Form.Item>
          <Form.Item name="description" label="Detailed Description" rules={[{ type: 'string' }]}>
            <TextArea rows={4} placeholder="Detailed description" />
          </Form.Item>
          <Form.Item name="imageurl" label="Image URL" rules={[{ type: 'string' }]}>
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          {/* 新增 location 欄位 */}
          <Form.Item name="location" label="Location" rules={contentRules}>
            <Input placeholder="Enter hotel location (e.g., New York, Paris  )" />
          </Form.Item>
          {/* 新增 price 欄位 */}
          <Form.Item name="price" label="Price" rules={priceRules}>
            <Input type="number" step="1" placeholder="Enter price (e.g., 150)" />
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
