'use strict';
import express from 'express';
const router = express.Router();

router.get('/proxy', async (req, res) => {
  try {
    console.log('Attempting to fetch data from Google Apps Script...');
    const response = await fetch(
      'https://script.google.com/macros/s/AKfycbzqLw_2LVKirEjSA1VpPd02oDhssPZpXXmnJlgCcRRIdYRIkKksbcJBvX5XcWaXp-_Cqg/exec?timestamp=' +
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
      // If the latest score is not from today, remove it from the response
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

export default router;
