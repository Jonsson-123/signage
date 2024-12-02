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

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
