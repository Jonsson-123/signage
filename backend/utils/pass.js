import { config } from 'dotenv';
config();

import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import passportJWT from 'passport-jwt';
import User from '../models/User.js'; // Ensure the correct path and extension

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// Define a local strategy for username and password login
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find a user in the database with the provided username
      console.log(username, password, 'LocalStrategy');
      const user = await User.findOne({ name: username });

      console.log(user, 'user exists');
      // Check if the user exists
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      // Compare the provided password with the stored password using bcrypt
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      console.log('ismatch');
      // Convert the Mongoose document to a plain JavaScript object
      const userObject = user.toObject();

      console.log(userObject, 'USER OBJECT');
      // Delete the password property from the user object
      delete userObject.password;
      console.log(userObject, 'userr without password');
      return done(null, userObject, { message: 'Logged In Successfully' });
    } catch (err) {
      return done(err);
    }
  })
);

// Define a JWT strategy for handling JSON Web Tokens
passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    (jwtPayload, done) => {
      console.log('JWTStrategy', jwtPayload); // Log the JWT payload
      done(null, jwtPayload); // Pass the JWT payload as the authenticated user
    }
  )
);

export default passport; // Export passport as the default export
