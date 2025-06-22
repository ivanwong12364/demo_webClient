//import './App.css';
import 'antd/dist/reset.css';
import { Layout, Space, FloatButton } from 'antd';
import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
//import Landing from "./components/Landing"
import * as AuthService from "./services/auth.service";
import UserT from './types/user.type';
import Login from "./components/Login";
import Register from "./components/Register";
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import About from './components/About';
//import DetailArticle from './components/DetailArticle';
import DetailArticle from './components/DetailArticle';
import DetailHotel from './components/DetailHotel';
import Profile from './components/Profile';
import FavPage from './components/favpage';
import HotelSearch from './components/HotelSearch'; // Import HotelSearch
import { LogoutOutlined, HomeOutlined, DashboardOutlined, InfoCircleOutlined, HeartFilled, SearchOutlined } from '@ant-design/icons';
import Copyright from './components/Copyright';
import { Avatar } from 'antd';

const { Header, Content, Footer } = Layout;

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserT | undefined>(undefined);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
  }, []);

  const logOut = () => {
    AuthService.logout();
    setCurrentUser(undefined);
  };

  return (
    <Router>
      <Layout>
        <Header>              
          <nav style={{ float: 'left' }}>  
            <div> <Space> 
              <Link to={"/"} >
                <img
                  src="/src/assets/small_Coventry_University.png"
                  alt="profile-img"
                  className="profile-img-card"
                />
              </Link>   
              <Link to="/"><HomeOutlined style={{ fontSize: '40px' }} /></Link>
              <Link to="/dashboard"><DashboardOutlined style={{ fontSize: '40px' }} /></Link>
              <Link to="/about"><InfoCircleOutlined style={{ fontSize: '40px' }} /></Link>  
              <Link to="/hotelsSearch"><SearchOutlined style={{ fontSize: '40px' }} /></Link>       
            </Space></div>
          </nav>
           
          <nav style={{ float: 'right' }}>
            {currentUser ? ( <div> 
              <Link to={"/profile"} >   
                {currentUser.avatarurl && currentUser.avatarurl.indexOf('http') >= 0 ? (
                  <Avatar size="large" src={currentUser.avatarurl} />
                ) : (
                  <Avatar size="large" style={{ backgroundColor: '#87d068' }}>{currentUser.username}</Avatar>
                )}
              </Link> <Space align="center"> <div> 
                <Link to="/favpage"><HeartFilled style={{ fontSize: '40px' }} /></Link>                        
                <a href="/" className="nav-link" onClick={logOut}><LogoutOutlined style={{ fontSize: '40px' }} /></a>               
              </div> </Space> </div> ) : (
              <div><Space> 
                <Login />
                <Link to="/register">Register</Link> 
              </Space></div>   
            )}           
          </nav>
        </Header>
        <Content>
          <Routes>
            <Route index element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />  
            <Route path="/about" element={<About />} />
            <Route path="/:aid" element={<DetailHotel />} />            
            <Route path="/profile" element={<Profile />} />
            <Route path="/register" element={<Register />} />
            <Route path="/favpage" element={<FavPage />} />
            <Route path="/hotelsSearch" element={<HotelSearch />} /> {/* Add HotelSearch route */}
          </Routes>
        </Content>
        <Footer>
          <Copyright /><img
            src="/src/assets/SHAPE_logo.png"
            alt="profile-img"
            className="profile-img-card"
            style={{ float: 'right' }}
          />
        </Footer>
        <FloatButton.BackTop />
      </Layout>
    </Router>
  );
}