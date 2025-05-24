require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 9876;
const WINDOW_SIZE = 10;
const Thirdpartyurl = "http://20.244.56.144/evaluation-service";


// Short form endpoints
const ENDPOINTS = {
  p: 'http://20.244.56.144/test/prime',
  f: 'http://20.244.56.144/test/fibo',
  e: 'http://20.244.56.144/test/even',
  r: 'http://20.244.56.144/test/rand'
};

// Full name to short key mapping
const ALIASES = {
  prime: 'p',
  fibo: 'f',
  even: 'e',
  rand: 'r'
};

// Store a sliding window for each type
const windows = {
  p: [],
  f: [],
  e: [],
  r: []
};

// Function to calculate average
function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}

// Route to fetch numbers
app.get('/numbers/:numberid', async (req, res) => {
  let { numberid } = req.params;
  numberid = numberid.toLowerCase().trim();

  // Convert alias to short key
  if (ALIASES[numberid]) {
    numberid = ALIASES[numberid];
  }

  // Validate number ID
  if (!ENDPOINTS.hasOwnProperty(numberid)) {
    return res.status(400).json({
      error: "Invalid number ID. Allowed values: 'p', 'f', 'e', 'r' or 'prime', 'fibo', 'even', 'rand'"
    });
  }

  const prevWindow = [...windows[numberid]];
  let newNumbers = [];

  try {
    const response = await axios.get(ENDPOINTS[numberid], {
      timeout: 500,
      headers: {
        Authorization: `Bearer ${process.env.BEARER_TOKEN}`
      }
    });

    const received = response.data.numbers || [];

    received.forEach(num => {
      if (!windows[numberid].includes(num)) {
        windows[numberid].push(num);
        if (windows[numberid].length > WINDOW_SIZE) {
          windows[numberid].shift();
        }
      }
    });

    newNumbers = received;

    return res.json({
      windowPrevState: prevWindow,
      windowCurrState: [...windows[numberid]],
      numbers: newNumbers,
      avg: calculateAverage(windows[numberid])
    });

  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({ error: 'Request to third-party API timed out' });
    } else if (error.response) {
      return res.status(error.response.status).json({ error: 'Third-party API error', details: error.response.data });
    } else {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
