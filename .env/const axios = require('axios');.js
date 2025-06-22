import axios from 'axios';

const axios = require('axios');

const url = 'https://api.makcorps.com/auth';
const payload = {
  username: 'your_username',
  password: 'your_password'
};

const headers = {
  'Content-Type': 'application/json'
};

axios.post(url, payload, { headers })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });