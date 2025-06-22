import React from 'react';
import { Card, Button, Row, Col, Typography, Tag } from 'antd';
import { LineOutlined, HomeOutlined, DollarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface TravelPackage {
  id: string;
  flightRoute: string;
  hotelName: string;
  price: number;
  duration: string;
  rating: number;
}

const mockPackages: TravelPackage[] = [
  {
    id: '1',
    flightRoute: 'New York → Los Angeles',
    hotelName: 'Grand Plaza Hotel',
    price: 499,
    duration: '3 nights',
    rating: 4.5,
  },
  {
    id: '2',
    flightRoute: 'London → Paris',
    hotelName: 'Champs Élysées Palace',
    price: 799,
    duration: '4 nights',
    rating: 4.8,
  },
  {
    id: '3',
    flightRoute: 'Tokyo → Kyoto',
    hotelName: 'Sakura Garden Resort',
    price: 899,
    duration: '5 nights',
    rating: 4.7,
  },
  {
    id: '4',
    flightRoute: 'Sydney → Melbourne',
    hotelName: 'Harbor View Hotel',
    price: 599,
    duration: '3 nights',
    rating: 4.3,
  },
  {
    id: '5',
    flightRoute: 'Dubai → Abu Dhabi',
    hotelName: 'Desert Oasis Resort',
    price: 699,
    duration: '4 nights',
    rating: 4.6,
  },
  {
    id: '6',
    flightRoute: 'Singapore → Bangkok',
    hotelName: 'Tropical Paradise Hotel',
    price: 549,
    duration: '3 nights',
    rating: 4.4,
  },
];

const TravelPackage: React.FC = () => {
  const handleBookNow = (packageId: string) => {
    // This would be connected to a booking system in a real application
    console.log(`Booking package ${packageId}`);
    // For now, just show an alert
    alert(`Booking functionality would be implemented here for package ${packageId}`);
  };

  return (
    <div className="travel-package-section">
      <Title level={2} className="travel-package-header">
        <LineOutlined style={{ marginRight: 8 }} />
        Travel Packages
      </Title>
      
      <Row gutter={[16, 16]}>
        {mockPackages.map((pkg) => (
          <Col xs={24} sm={12} lg={8} key={pkg.id}>
            <Card
              hoverable
              className="travel-package-card"
              actions={[
                <Button 
                  type="primary" 
                  onClick={() => handleBookNow(pkg.id)}
                  icon={<DollarOutlined />}
                >
                  Book Now
                </Button>
              ]}
            >
              <div style={{ marginBottom: 16 }}>
                <div className="travel-package-meta">
                  <LineOutlined style={{ color: '#1890ff' }} />
                  <Text strong>{pkg.flightRoute}</Text>
                </div>
                
                <div className="travel-package-meta">
                  <HomeOutlined style={{ color: '#52c41a' }} />
                  <Text>{pkg.hotelName}</Text>
                </div>
                
                <div style={{ marginBottom: 12 }}>
                  <Tag color="blue">{pkg.duration}</Tag>
                  <Tag color="gold">★ {pkg.rating}</Tag>
                </div>
              </div>
              
              <div className="travel-package-price">
                ${pkg.price}
                <br />
                <Text type="secondary" style={{ fontSize: '1rem' }}>per person</Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default TravelPackage; 