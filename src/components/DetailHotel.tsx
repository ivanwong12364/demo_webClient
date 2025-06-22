import 'antd/dist/reset.css';
import React from 'react';
import EditForm from './EditForm';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spin, Col, Card, Alert, Typography, Row, Divider, Descriptions, Tag } from 'antd';
import { api } from './common/http-common';
import axios from 'axios';
import { RollbackOutlined, LoadingOutlined, CloseSquareOutlined, CloseSquareFilled, EditOutlined, HomeOutlined } from '@ant-design/icons';
import { getCurrentUser } from "../services/auth.service";

const { Title, Paragraph, Text } = Typography;

interface Hotel {
  id: number;
  title: string;
  alltext: string;
  summary: string;
  imageurl: string;
  agencyid: number;
  description: string;
  location:string;
  price:number;
  links?: {
    likes: string;
    fav: string;
    msg: string;
    self: string;
  };
}

const DetailHotel = () => {
  const currentUser = getCurrentUser();
  const { aid } = useParams();
  const [hotel, setHotel] = React.useState<Hotel | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [theme, setTheme] = React.useState('outlined');

  React.useEffect(() => {
    const fetchHotel = async () => {
      try {
        const url = `${api.uri}/hotels/${aid}`;
        console.log(`Fetching hotel from: ${url}`);
        const res = await axios.get(url);
        setHotel(res.data);
      } catch (err: any) {
        console.error('Error fetching Hotel details:', err);
        setError('Failed to fetch hotel details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [aid]);
  
  const handleDelete = () => {
    if (!hotel) return;
    setTheme('filled');

    axios.delete(`${api.uri}/hotels/${hotel.id}`, {
      headers: { "Authorization": `Basic ${localStorage.getItem('aToken')}` }
    })
    .then((results) => {
      if (results.data.message === "removed") {
        alert("This hotel has been removed from the list.");
        navigate("/");
        window.location.reload();
      }
    })
    .catch((err) => {
      console.log(`Check network problems pls.`, err);
      alert("Check network problems");
    });      
  }

  if (loading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
    return <Spin indicator={antIcon} />;
  }

  if (error) {
    return <Alert message="Error" description={error} type="error" showIcon />;
  }

  if (!hotel) {
    return <Alert message="Not Found" description="The requested hotel could not be found." type="warning" showIcon />;
  }
  
  const Icon = theme === 'filled' ? CloseSquareFilled : CloseSquareOutlined;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        <HomeOutlined /> Hotel Agent Dashboard
      </Title>   
      
      <Card>
        <Row gutter={[32, 32]}>
          {/* Image Column */}
          <Col xs={24} md={10}>
            
          </Col>

          {/* Details Column */}
          <Col xs={24} md={14}>
            <Title level={3}>{hotel.title}</Title>
           
            
            <Divider />

            

            <Descriptions bordered column={1}>
              <Descriptions.Item label="Summary">
                <Paragraph>{hotel.summary}</Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="About">
                <Paragraph>{hotel.alltext}</Paragraph>
              </Descriptions.Item>
              <Descriptions.Item label="Detailed Description">
                <Paragraph>{hotel.description}</Paragraph>
              </Descriptions.Item>
                 <Descriptions.Item label="location">
                <Paragraph>{hotel.location}</Paragraph>
              </Descriptions.Item>
                 <Descriptions.Item label="price/person">
                <Paragraph>${hotel.price}</Paragraph>
              </Descriptions.Item>

            </Descriptions>

            <Divider />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px' }}>
              <Button  
                type="primary"
                icon={<RollbackOutlined />}
                onClick={() => navigate(-1)} 
              >
                Back
              </Button>

              <div>
                {(currentUser?.role === "admin" && currentUser.id === hotel.agencyid) && (
                  <>
                    <EditForm isNew={false} aid={String(hotel.id)} />
                    <Button 
                      danger 
                      icon={<Icon />} 
                      onClick={handleDelete} 
                      style={{ marginLeft: '8px' }}
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default DetailHotel;