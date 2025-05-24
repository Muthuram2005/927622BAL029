const express = require('express');
const axios = require('axios');
const moment = require('moment');
const { mean } = require('mathjs');

const app = express();
app.use(express.json());

// Credentials and tokens
const CLIENT_ID = "2a881dd4-34ad-4c13-bfdd-5d3bb4b377f1";
const CLIENT_SECRET = "jzxamxRrXGQVuFaa";
const ACCESS_CODE = "wheQUy";
const ACCESS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzQ4MDY4MjM5LCJpYXQiOjE3NDgwNjc5MzksImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjJhODgxZGQ0LTM0YWQtNGMxMy1iZmRkLTVkM2JiNGIzNzdmMSIsInN1YiI6Im11dGh1cmFtc2FrdGhpMTdAZ21haWwuY29tIn0sImVtYWlsIjoibXV0aHVyYW1zYWt0aGkxN0BnbWFpbC5jb20iLCJuYW1lIjoibXV0aHVyYW0gcyIsInJvbGxObyI6IjkyNzYyMmJhbDAyOSIsImFjY2Vzc0NvZGUiOiJ3aGVRVXkiLCJjbGllbnRJRCI6IjJhODgxZGQ0LTM0YWQtNGMxMy1iZmRkLTVkM2JiNGIzNzdmMSIsImNsaWVudFNlY3JldCI6Imp6eGFteFJyXEdRVnVGYWEifQ.gNLoZG4oAzQe9aCy9AcaSYI2hjT5DskCJHJ6_so1IAs";
const TOKEN_TYPE = "Bearer";

// Example route that calls a protected API using the token
app.get('/protected-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.example.com/data', {
      headers: {
        Authorization: `${TOKEN_TYPE} ${ACCESS_TOKEN}`
      }
    });

    // Example: process data, calculate average of some numeric field
    const data = response.data;
    // Assuming data is an array of objects with 'value' fields
    const values = data.map(item => item.value).filter(v => typeof v === 'number');
    const avg = mean(values);

    res.json({
      success: true,
      averageValue: avg,
      rawData: data
    });
  } catch (error) {
    console.error('Error fetching protected data:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch protected data.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
