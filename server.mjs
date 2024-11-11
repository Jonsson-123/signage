import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = 3000;

// Helper to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (like feedback.js) from the current directory
app.use(express.static(__dirname));

// Route to serve feedback.html
app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, 'feedback.html'));
});

// Proxy route for fetching data from Google Apps Script
app.get('/proxy', async (req, res) => {
  try {
    console.log('Attempting to fetch data from Google Apps Script...');
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbxs2RfgRH04m-7LbX2APfh63Da3vJy2IHx9HWIQZYPMSrJhw19k94v9Ougb3qWhzIyq0A/exec?timestamp=' +
        new Date().getTime()
    );
    if (!response.ok) {
      console.error(
        `Failed to fetch data: ${response.status} - ${response.statusText}`
      );
      return res.status(response.status).json({
        error: `Failed to fetch data: ${response.status} - ${response.statusText}`,
      });
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('Data fetched successfully:', data);

      // Check if latestScoreTimestamp is from today
      const latestScoreTimestamp = new Date(data.latestScoreTimestamp);
      const today = new Date();
      if (
        latestScoreTimestamp.getDate() !== today.getDate() ||
        latestScoreTimestamp.getMonth() !== today.getMonth() ||
        latestScoreTimestamp.getFullYear() !== today.getFullYear()
      ) {
        delete data.latest_score;
      }

      res.set('Access-Control-Allow-Origin', '*'); // Set CORS header
      res.json(data);
    } else {
      // Log the text response if it’s not JSON, for debugging
      const textResponse = await response.text();
      console.error('Received non-JSON response:', textResponse);
      res.status(500).json({
        error: 'Error: Received non-JSON response from Google Apps Script.',
        response: textResponse,
      });
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: `Error fetching data: ${error.message}` });
  }
});

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
