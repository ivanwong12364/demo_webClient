import 'antd/dist/reset.css';
import React from "react";
import { getCurrentUser } from "../services/auth.service";
import SearchUser from './userSearch'
import ImageUpload from './ImageUpload'
import { NavigateFunction, useNavigate } from 'react-router-dom';
import axios from "axios";
import { api } from './common/http-common';
import { Form, Input, Button,Row, Col, Space } from 'antd';
import { Avatar} from 'antd';
import {  DeleteOutlined, UserOutlined } from '@ant-design/icons';
import EditForm from "./EditForm";
import UserT from "../types/user.type";


const { TextArea } = Input;
const Profile: React.FC = () => {
const currentUser = getCurrentUser();
const navigate: NavigateFunction = useNavigate();

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
   
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  
  },
 };
  
 let ava:any 
 let ab:any 
  
 if(currentUser.avatarurl!== undefined &&currentUser.avatarurl!==null)
  ava=currentUser.avatarurl
 else
   ava= " avatarurl "
    
console.log("avatarurl " + ava)
   
 

if(currentUser.about!== undefined &&currentUser.about!==null)
  ab=currentUser.about
 else
   ab= " about me "
    
console.log("about " + ab)
 
 const initialValues: UserT = {
  username: currentUser.username,
  email: currentUser.email,
  password:"",
  avatarurl:ava,
  about: ab,  
  role:   currentUser.role,
  actiCode: "" 
};



const handleDelete = () => {
 if (window.confirm("Are you sure to delete your user account? ")) { 
axios.delete(`${api.uri}/users/${currentUser.id}`, {
     
      headers: {
          "Authorization": `Basic ${localStorage.getItem('aToken')}`
        }
      }        
  )
    .then((results) =>{ console.log('respone ',JSON.stringify(results.data ))
      if(results.data )
    {  
        alert( `All   records for user with id ${currentUser.id} are removed the Hotel Agent` )
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
      }
      
    })
    .catch((err) => {
    console.log(`Check network problems pls. `+err);
       alert("Check network problems");
})      
}
}

const handleFormSubmit  = (values: UserT) => {

      let str = values.about  
      const upDateUser = {
      username: values.username,
      email: values.email,
      password:values.password,
      avatarurl:values.avatarurl,
      about:str.replace(/[&\/\\#,+()$~%.`'":*?<>{}]/g,'_'),
      
       
    }
    console.log(` password:  ${currentUser.password}`)
   console.log(`path: ${api.uri}/users/${currentUser.id}`)
   console.log(`upDateUser: ${JSON.stringify(upDateUser)}`)
    axios.put(`${api.uri}/users/${currentUser.id}`, upDateUser, {
        headers: {
          'Authorization': `Basic ${localStorage.getItem('aToken')}`
        }
      })
        .then((res)=> {
        alert("User updated..pls login again to refresh data")
        console.log(res.data);
        localStorage.removeItem("user");
         navigate("/");
        window.location.reload();
       });
  }
   
 

console.log('current user' + JSON.stringify(currentUser))
  return (
    <>
     <p></p>
     <div style={{marginRight:"15px",marginBottom:"15px"}}>
      <h2 style={{color:"#135200"}}>
          <strong>{currentUser.username}</strong> Profile
      </h2>
      <Form  { ...formItemLayout}  style={{ maxWidth: 720 }}  initialValues={initialValues} onFinish={(values)=>handleFormSubmit(values)}>
      <Form.Item name="username" label="Username" >
      <Input placeholder={currentUser.username} />
      </Form.Item>
      <Form.Item name="email" label="email"  rules={[
                     {type: 'email',
                       message: 'The input is not valid E-mail!',
                     },
                     {required: false,
                       message: 'Please input your E-mail!',
                     },
                   ]} >
      <Input   placeholder={currentUser.email} />      
      </Form.Item>
      <Form.Item name="password" label="New password" rules={[
                     {
                       required: false,
                       message: 'Please input your new password!',
                     },
                   ]}
                   hasFeedback  >
      <Input.Password   placeholder="Enter New Password"  />      
      </Form.Item >
      <Form.Item name="confirm" label="Confirm new password"  dependencies={['password']}
                   hasFeedback
                   rules={[
                     {
                       required: false,
                       message: 'Please confirm your password!',
                     },
                     ({ getFieldValue }) => ({
                       validator(_, value) {
                         if (!value || getFieldValue('password') === value) {
                           return Promise.resolve();
                         }
                         return Promise.reject(new Error('The new password that you entered do not match!'));
                       },
                     }),
                   ]} >
      <Input.Password    placeholder="Confirm Password" />      
      </Form.Item>
      <Form.Item name="about" label="About me" >
      <TextArea rows={2} placeholder={ab} />
      </Form.Item>
      <Form.Item name="avatarurl" label="Avatarurl" >
      <TextArea rows={2} placeholder={ava} />
      </Form.Item>
      <Form.Item  name="avatar " label="Avatar" >
      <Space style={{display: 'flex', justifyContent:'flex-center'}} size={16} wrap> 
      {ava.indexOf('http') >= 0 ?  (<Avatar src={ava} />) : (<Avatar  icon={<UserOutlined />} />)
      }
      </Space>  
      </Form.Item>
      <Form.Item name="role" label="Role"  >
      <Input disabled  placeholder={currentUser.role} />      
      </Form.Item>
      <Form.Item wrapperCol={{ offset: 5, span: 10 }}>
      <Button type="primary" htmlType="submit">Submit Changes</Button>
      {currentUser.role!== "admin"&& < DeleteOutlined  style ={{fontSize:"32px",color:"red"  }} onClick={()=>handleDelete()}/>} 
      </Form.Item> 
      </Form>          
      </div>
      <Row >  
      <Col span={18}>
      <div style={{marginLeft:"15px",marginBottom:"15px"}}>
      { currentUser.role=="admin"&& <SearchUser authbasic={ `${currentUser.atoken}`}/>}
      </div></Col>
      </Row>
      <Row>
      <Col span={18}>
        <div style={{marginLeft:"15px",marginBottom:"15px"}}>
        <ImageUpload />
      </div>
      </Col></Row>
      <Row>
      <Col span={18}>
        
        <div style={{marginLeft:"15px",marginBottom:"15px"}}>
        {currentUser.role=="admin"&&  <EditForm  isNew={true} />} {currentUser.role=="admin"?  (<h3> Create New Hotel info </h3>):(<br/>)}</div>
      </Col>    
      </Row>
        
      
     
      
            </>
  )

};

export default Profile;
