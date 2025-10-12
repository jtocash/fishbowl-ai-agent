const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Fishbowl API configuration
const FISHBOWL_BASE_URL = process.env.FISHBOWL_BASE_URL

// Routes

app.get('/api/test', (req, res) => {
    res.set('X-Debug', 'cors-active');
    res.json({ ok: true });
  });
  
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend API is running!' });
});

app.get('/api/fishbowl/login', (req, res) => {
    console.log('Starting Fishbowl login request...');
    console.log('URL:', `${FISHBOWL_BASE_URL}`);
    console.log('Username:', process.env.FISHBOWL_USERNAME);
    console.log('Password set:', !!process.env.FISHBOWL_PASSWORD);
    
    axios.post(`${FISHBOWL_BASE_URL}/login`, {
        appName: 'Fishbowl API Integration',
        appDescription: 'Fishbowl API Integration',
        appId: 11111,
        username: process.env.FISHBOWL_USERNAME,
        password: process.env.FISHBOWL_PASSWORD
    }, {
        headers: {
            'Content-Type': 'application/json',
        },
        timeout: 10000 // 10 second timeout
    })
    .then(response => {
        console.log('Fishbowl response status:', response.status);
        console.log('Fishbowl response data:', response.data);
        
        // Check if the response contains a token
        if (response.data && response.data.token) {
            res.json({
                success: true,
                token: response.data.token,
                data: response.data
            });
        } else {
            res.json({
                success: false,
                error: 'No token received from Fishbowl API',
                data: response.data
            });
        }
    })
    .catch(error => {
        console.error('Fishbowl login error:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data
        });
        
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ 
                success: false,
                error: 'Connection refused - check if Fishbowl server is running' 
            });
        } else if (error.code === 'ETIMEDOUT') {
            res.status(500).json({ 
                success: false,
                error: 'Request timed out - Fishbowl server may be slow' 
            });
        } else {
            res.status(500).json({ 
                success: false,
                error: error.response?.data?.message || error.message,
                details: {
                    status: error.response?.status,
                    statusText: error.response?.statusText
                }
            });
        }
    });
});         

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

