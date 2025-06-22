import 'antd/dist/reset.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row, Spin } from 'antd';
import { api } from './common/http-common';
import axios from 'axios';
import { LoadingOutlined } from '@ant-design/icons';
import PostIcon from './posticon';
import Displaycomment from './comments';
import { useDebounce } from 'use-debounce';
import { Input } from 'antd';

const { Search } = Input;

const Hotel = () => {
  const [hotels, setHotels] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  React.useEffect(() => {
    axios
      .get(`${api.uri}/hotels`)
      .then((res) => {
        setHotels(res.data);
        localStorage.setItem('a', JSON.stringify(res.data));
      })
      .catch((error) => {
        console.error('Failed to fetch hotels:', error);
        setHotels([]); // Set to empty array on failure
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const filteredHotels = React.useMemo(() => {
    if (!debouncedSearch) return hotels;

    const searchLower = debouncedSearch.toLowerCase();
    return hotels.filter((hotel) =>
      Object.values(hotel).some((value) =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }, [hotels, debouncedSearch]);

  if (loading) {
    const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;
    return <Spin indicator={antIcon} />;
  } else {
    if (!hotels || hotels.length === 0) {
      return <div>There are no hotels available now.</div>;
    } else {
      return (
        <>
          <div className="search-container">
            <Search
              placeholder="input search text"
              value={searchQuery}
              style={{ width: '400px' }}
              onChange={(e) => setSearchQuery(e.target.value)}
              enterButton="Search"
              loading={loading}
            />
            <p></p>
          </div>

          <Row gutter={[16, 16]} style={{ marginLeft: '15px' }}>
            {hotels &&
              filteredHotels.map(({ id, title, imageurl, links }) => (
                <Col key={id}>
                  <Card
                    title={title}
                    style={{ width: 300 }}
                   cover={<img alt="example" src={imageurl.replace("/api/v1/images", "")} />}
                    hoverable
                    actions={[
                      <PostIcon type="like" countLink={links.likes} id={id} />,
                      <Displaycomment msgLink={links.msg} id={id} />,
                      <PostIcon type="heart" FavLink={links.fav} id={id} />,
                    ]}
                  >
                    <Link to={`/${id}`}>Details</Link>
                  </Card>
                </Col>
              ))}
          </Row>
        </>
      );
    }
  }
};

export default Hotel;