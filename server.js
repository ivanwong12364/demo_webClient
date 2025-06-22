const express = require('express');
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const CryptoJS = require('crypto-js');
const app = express();

app.use(express.json());

// Replace with your actual credentials from the X Developer Portal
const X_API_KEY = '1931304185389264896SJOD3O9TEL';
const X_API_SECRET = 'YOUR_NEW_API_SECRET_FROM_PORTAL'; // Reveal from portal
const X_ACCESS_TOKEN = 'YOUR_NEW_ACCESS_TOKEN_FROM_PORTAL'; // Copy from portal
const X_ACCESS_SECRET = 'YOUR_NEW_ACCESS_SECRET_FROM_PORTAL'; // Copy from portal

const oauth = OAuth({
  consumer: { key: X_API_KEY, secret: X_API_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
  },
});

app.post('/api/postTweet', async (req, res) => {
  const { text } = req.body;
  const url = 'https://api.twitter.com/2/tweets';
  const token = { key: X_ACCESS_TOKEN, secret: X_ACCESS_SECRET };
  const oauthHeader = oauth.toHeader(oauth.authorize({ url, method: 'POST', data: { text } }, token));

  try {
    const response = await axios.post(url, { text }, { headers: { ...oauthHeader, 'Content-Type': 'application/json' } });
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.response?.data || error.message });
  }
});

app.listen(3001, () => console.log('Server running on http://localhost:3001'));