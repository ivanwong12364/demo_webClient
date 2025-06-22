import React from 'react';
import 'antd/dist/reset.css';
import { Upload, Button, message, Alert, Typography } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { api } from './common/http-common';
import { getCurrentUser } from "../services/auth.service";

interface ImageUploadState {
  fileList: File[];
  uploading: boolean;
  imgPosted: any[];
  isUploadOk: boolean;
}
const currentUser = getCurrentUser();

class ImageUpload extends React.Component<{}, ImageUploadState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      fileList: [],
      uploading: false,
      imgPosted: [],
      isUploadOk: false,
    };
  }

  handleUpload = () => {
    const { fileList } = this.state;
    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('upload', file, file.name);
    });

    this.setState({ uploading: true });

    const requestOptions = {
      method: 'POST',
      body: formData,
      redirect: 'follow',
    };

    fetch(`${api.uri}/images`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        message.success('Upload successful.');
        this.setState({
          isUploadOk: true,
          imgPosted: result,
        });
      })
      .catch((error) => {
        message.error(`Upload failed: ${error.message}`);
        console.error('Error:', error);
      })
      .finally(() => {
        this.setState({ uploading: false });
      });
  };

  render() {
    const { Title } = Typography;
    const { uploading, fileList, isUploadOk, imgPosted } = this.state;

    const uploadProps = {
      onRemove: (file: File) => {
        this.setState((state) => ({
          fileList: state.fileList.filter((f) => f !== file),
        }));
      },
      beforeUpload: (file: File) => {
        this.setState((state) => ({
          fileList: [...state.fileList, file],
        }));
        return false;
      },
      fileList,
    };

    return (
      <div>
       { currentUser.role=="admin"? (<Title level={3} style={{ color: '#0032b3' }}>
          Select and Upload Hotel or Avatar Image
        </Title> ) :(<Title level={3} style={{ color: '#0032b3' }}>
          Select and Upload Avatar Image
        </Title>)}
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} aria-label="Select File">
            Select File
          </Button>
        </Upload>
        <Button
          type="primary"
          onClick={this.handleUpload}
          disabled={fileList.length === 0}
          loading={uploading}
          style={{ marginTop: 16 }}
        >
          {uploading ? 'Uploading' : 'Start Upload'}
        </Button>
        {isUploadOk && (
          <div>
            <p style={{ color: 'red' }}>Image uploaded successfully:</p>
            <Alert message={JSON.stringify(imgPosted)} type="success" />
          </div>
        )}
      </div>
    );
  }
}

export default ImageUpload;