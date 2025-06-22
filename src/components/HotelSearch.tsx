// HotelSearch.tsx
import { useState } from 'react';
import {
  Input,
  Button,
  Form,
  DatePicker,
  Select,
  Table,
  Alert,
  Typography,
  Spin,
  Row,
  Col,
  Divider,
  Card,
} from 'antd';
import {
  fetchHotelsById,
  fetchHotelsByCity,
  fetchCityId,
  HotelSearchParams,
  Vendor,
} from '../services/hotelbeds.service';
import dayjs, { Dayjs } from 'dayjs';
import TravelPackage from './TravelPackage';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const CURRENCIES = ['USD', 'EUR', 'INR', 'GBP'];

const HotelSearch = () => {
  const [form] = Form.useForm();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchType, setSearchType] = useState<'city' | 'hotelid'>('city');
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);

  const handleSearch = async (values: any) => {
    setLoading(true);
    setError(null);
    setVendors([]);
    setSearchPerformed(true);

    const commonParams: Omit<HotelSearchParams, 'hotelid' | 'cityid'> = {
      rooms: values.rooms,
      adults: values.adults,
      checkin: values.dates[0].format('YYYY-MM-DD'),
      checkout: values.dates[1].format('YYYY-MM-DD'),
      cur: values.cur,
    };

    try {
      let results: Vendor[] = [];
      if (searchType === 'hotelid') {
        const params: HotelSearchParams = {
          ...commonParams,
          hotelid: values.hotelid,
        };
        results = await fetchHotelsById(params);
      } else if (searchType === 'city') {
        const cityId = await fetchCityId(values.city);
        const params: HotelSearchParams = {
          ...commonParams,
          cityid: cityId,
        };
        results = await fetchHotelsByCity(params);
      }
      setVendors(results);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current: Dayjs) => current && current < dayjs().startOf('day');

  const columns = [
    {
      title: 'Vendor',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => (
        <span style={{ color: '#1890ff', fontWeight: 'bold' }}>
          {price || 'N/A'}
        </span>
      ),
      sorter: (a: Vendor, b: Vendor) =>
        parseFloat(a.price?.replace(/[^0-9.]/g, '') || '0') -
        parseFloat(b.price?.replace(/[^0-9.]/g, '') || '0'),
    },
    {
      title: 'Tax',
      dataIndex: 'tax',
      key: 'tax',
      render: (tax: string) => (
        <span style={{ color: '#52c41a' }}>
          {tax || 'N/A'}
        </span>
      ),
    },
  ];

  return (
    <div className="hotel-search-container">
      <Title level={2} className="hotel-search-header">
        🏨 Hotel Price Search
      </Title>

      {/* Help Card */}
      {!searchPerformed && (
        <Card className="hotel-search-tips">
          <Title level={4}>💡 Search Tips</Title>
          <Paragraph>
            <strong>For City Search:</strong> Try popular cities like "New York", "London", "Tokyo", "Paris", "Sydney"
          </Paragraph>
          <Paragraph>
            <strong>For Hotel ID Search:</strong> Use specific hotel IDs like "4232686" (you can find these in hotel listings)
          </Paragraph>
          <Paragraph>
            <strong>Note:</strong> Make sure to select dates at least 1 day in the future for best results.
          </Paragraph>
        </Card>
      )}

      <Form
        className="hotel-search-form"
        form={form}
        layout="vertical"
        onFinish={handleSearch}
        initialValues={{
          searchType: 'city',
          rooms: 1,
          adults: 1,
          cur: 'USD',
          dates: [dayjs().add(1, 'day'), dayjs().add(2, 'day')],
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Search By" name="searchType">
              <Select onChange={setSearchType}>
                <Option value="city">City Name</Option>
                <Option value="hotelid">Hotel ID</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>

        {searchType === 'hotelid' && (
          <Form.Item
            label="Hotel ID"
            name="hotelid"
            rules={[{ required: true, message: 'Please enter a hotel ID' }]}
          >
            <Input placeholder="e.g. 4232686" />
          </Form.Item>
        )}

        {searchType === 'city' && (
          <Form.Item
            label="City Name"
            name="city"
            rules={[{ required: true, message: 'Please enter a city name' }]}
          >
            <Input placeholder="e.g. New York, London, Tokyo" />
          </Form.Item>
        )}

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Number of Rooms"
              name="rooms"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="number" min={1} placeholder="e.g. 1" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Number of Adults"
              name="adults"
              rules={[{ required: true, message: 'Required' }]}
            >
              <Input type="number" min={1} placeholder="e.g. 1" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Check-in and Check-out Dates"
          name="dates"
          rules={[{ required: true, message: 'Required' }]}
        >
          <DatePicker.RangePicker disabledDate={disabledDate} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item
          label="Currency"
          name="cur"
          rules={[{ required: true, message: 'Required' }]}
        >
          <Select>
            {CURRENCIES.map((cur) => (
              <Option key={cur} value={cur}>
                {cur}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" disabled={loading} size="large">
            {loading ? 'Searching...' : 'Search Hotels'}
          </Button>
        </Form.Item>
      </Form>

      {error && (
        <Alert 
          className="hotel-search-alert"
          message="Search Error" 
          description={
            <div>
              <p>{error}</p>
              <p><strong>Suggestions:</strong></p>
              <ul>
                <li>Check if the city name is spelled correctly</li>
                <li>Try a more specific city name (e.g., "New York" instead of "NY")</li>
                <li>Make sure your dates are in the future</li>
                <li>Try different search parameters</li>
              </ul>
            </div>
          }
          type="error" 
          showIcon 
        />
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin tip="Searching for hotel prices..." size="large" />
          <div style={{ marginTop: 16 }}>
            <Text type="secondary">This may take a few moments...</Text>
          </div>
        </div>
      )}

      {!loading && searchPerformed && vendors.length === 0 && !error && (
        <Alert
          className="hotel-search-alert"
          message="No Results Found"
          description="No hotel prices found for the specified criteria. Please try different dates or search parameters."
          type="info"
          showIcon
        />
      )}

      {!loading && vendors.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <Title level={3}>Hotel Price Results</Title>
          <Table
            className="hotel-search-table"
            columns={columns}
            dataSource={vendors}
            rowKey={(record) => record.name}
            pagination={{ pageSize: 10 }}
          />
        </div>
      )}

      {/* Travel Packages Section */}
      <Divider />
      <TravelPackage />
    </div>
  );
};

export default HotelSearch;
