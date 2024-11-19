import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import passport from './utils/pass.js';
import authRoutes from './routes/authRoutes.js';
import secureRoute from './routes/secureRoutes.js';
import cors from 'cors';
import { config } from 'dotenv';
config();
const app = express();
const PORT = 3000;

// Helper to get __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the ../frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Allow CORS for all routes
app.use(cors());

// Middleware for JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Connect to the MongoDB database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      socketTimeoutMS: 45000, // Increase socket timeout to 45 seconds
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1); // Exit process with failure
  }
};

connectDB();

// SET CORS HEADERS

app.use('/auth', authRoutes);
app.use(
  '/secure',
  passport.authenticate('jwt', { session: false }),
  secureRoute
);
// Route to serve feedback.html
app.get('/feedback', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/feedback.html'));
});

// Route to serve feedbackHistory.html
app.get('/feedbackHistory', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/feedbackHistory.html'));
});

// Proxy route for fetching data from Google Apps Script
/*
app.get('/proxy', async (req, res) => {
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
*/
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
