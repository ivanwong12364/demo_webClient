import 'antd/dist/reset.css';
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Col, Row, Spin } from 'antd';
//import Articles from './articles.json';
import { api } from './common/http-common';
import axios from 'axios';
import {LoadingOutlined} from '@ant-design/icons';
import PostIcon from './posticon';
import Displaycomment from './comments';
import { useDebounce } from 'use-debounce';
import { Input } from 'antd';
import { article } from '../../../Demo_API_Final/schema/article.schema';

const { Search } = Input;



const Article = () => {
  const [articles, setArticles] = React.useState([]);  
  const [loading, setLoading] = React.useState(true);    
  const [searchQuery, setSearchQuery] = React.useState<string>('');
  const [debouncedSearch] = useDebounce(searchQuery, 300);

  React.useEffect(()=>{
    axios.get(`${api.uri}/articles`)
      .then((res)=>{
        setArticles(res.data);   
        localStorage.setItem('a',JSON.stringify(res.data))                        
      })
      .then(()=>{
        setLoading(false);
      })  
            
  }, []);
   
  const filteredArticles = React.useMemo(() => {
    if (!debouncedSearch) return articles;
    
    const searchLower = debouncedSearch.toLowerCase();
    return articles.filter(article => 
      Object.values(article).some(value =>
        String(value).toLowerCase().includes(searchLower)
      )
    );
  }, [articles, debouncedSearch]);

 
  if(loading){
    const antIcon = <LoadingOutlined style={{ fontSize: 48}} spin />
    return(<Spin indicator={antIcon} />);
  } else {
    if(!articles){
      return(<div>There is no article available now.</div>)
    } else {
       
    
      return(<> 
      
      <div className="search-container">  
      <Search placeholder="input search text" value={searchQuery} style={{width:"400px"}}
        onChange={(e) => setSearchQuery(e.target.value)} enterButton="Search"   loading />
     <p></p></div>
        
        <Row gutter={[16,16]} style={{marginLeft:"15px"}}>
          {
            articles && filteredArticles.map(({id, title, imageurl, links})=> (
            <Col key={id}>                                          
             <Card title={title} style={{width: 300}}
                   cover={<img alt="example" src={imageurl} />} hoverable
                   actions={[
                    <PostIcon type="like" countLink={links.likes} id={id} />,
                    <Displaycomment    msgLink={links.msg} id={id}/>,
                    <PostIcon type="heart" FavLink={links.fav} id={id}/>
                  
                  ]} 
                   >               
                  <Link to= {`/${id}`}>Details</Link>
                 
                </Card>
                
              </Col>
            ))
          }
        </Row></>
      )
    }
  }
}


export default Article;