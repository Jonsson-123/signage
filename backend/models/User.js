import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from 'dotenv';
config();
// Define the user schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  countryid: String,
  userrole: {
    type: Number,
    default: 1, // Set the default value to 1
  },
  timecreated: {
    type: Date,
    default: Date.now,
  },
});

// Create the User model
const User = mongoose.model('User', userSchema);

// Function to initialize the default user
const initializeDefaultUser = async () => {
  try {
    const defaultName = process.env.DEFAULT_USER_NAME;
    const defaultPassword = process.env.DEFAULT_USER_PASSWORD;
    const existingUser = await User.findOne({ name: defaultName });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(defaultPassword, 10); // Hash the password
      const defaultUser = new User({
        name: defaultName,
        email: 'defaultuser@example.com',
        password: hashedPassword, // Store the hashed password
        countryid: 'defaultcountryid',
        userrole: 1,
      });
      await defaultUser.save();
      console.log('Default user created');
    } else {
      console.log('User already exists');
    }
  } catch (error) {
    console.error('Error initializing default user:', error);
  }
};

initializeDefaultUser();

export default User;
