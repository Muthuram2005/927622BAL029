require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;

// Define the endpoints for each number type
const ENDPOINTS = {
  p: 'http://20.244.56.144/test/prime',
  f: 'http://20.244.56.144/test/fibo',
  e: 'http://20.244.56.144/test/even',
  r: 'http://20.244.56.144/test/rand'
};

// Initialize sliding windows for each number type
const windows = {
  p: [],
  f: [],
  e: [],
  r: []
};

// Helper function to calculate average
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}

app.get('/numbers/:numberid', async (req, res) => {
  const { numberid } = req.params;

  // Validate numberid
  if (!ENDPOINTS[numberid]) {
    return res.status(400).json({ error: 'Invalid number ID' });
  }

  const previousWindow = [...windows[numberid]];
  let fetchedNumbers = [];

  try {
    const response = await axios.get(ENDPOINTS[numberid], {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`
      }
    });

    // Assuming the API returns an object with a 'numbers' array
    fetchedNumbers = response.data.numbers || [];

    // Update the sliding window with unique numbers
    fetchedNumbers.forEach((num) => {
      if (!windows[numberid].includes(num)) {
        windows[numberid].push(num);
        if (windows[numberid].length > WINDOW_SIZE) {
          windows[numberid].shift();
        }
      }
    });

    const currentWindow = [...windows[numberid]];
    const average = calculateAverage(currentWindow);

    return res.json({
      windowPrevState: previousWindow,
      windowCurrState: currentWindow,
      numbers: fetchedNumbers,
      avg: average
    });
  } catch (error) {
    // Handle timeout or other errors
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request timed out' });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
