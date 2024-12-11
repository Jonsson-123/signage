# Signage

A series of web applications that provide various functionalities including feedback collection from Nokia events that uses Google forms and has JWT authentication. Websites displaying timetables for public transportation and Lunch menus from Nokia One and Dream’s cafe restaurants. Check Wall of Wonders Trello backlog for access to Google forms, sheets, docs etc.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)

## Installation

1. Clone the repository:
   ```sh
   git clone https://github.com/Jonsson-123/signage.git
   cd signage
   ```
2. Setup your environment with NodeJs and MongoDB installed locally.

3. Install the dependencies for the backend:
   ```sh
   cd backend
   npm install
   ```

## Usage

1. Create a `.env` file in the `backend` directory with the following content:

   ```env
   JWT_SECRET=your_jwt_secret
   DEFAULT_USER_NAME=default_username
   DEFAULT_USER_PASSWORD=default_password
   MONGO_URI=mongodb://localhost:27017/wallofwonders
   GOOGLE_APPS_SCRIPT_URL=your_google_script
   ```

2. Start the backend server:
   ```sh
   cd backend
   npm start
   ```

## Project Structure

In the frontend folder you can find public transport HSL data surrounding Nokia Garage (hsl.html & hsl.js), similarly structured is the restaurant data from Nokia One and Dream's Cafe restaurants, "feedbackHistory" gives feedback from the past week's Garage events if they were collected while "feedback" is for live event rating gathering. Backend folder is for backend files.

## Environment Variables

The following environment variables need to be set in the `.env` file in the `backend` directory:

- `JWT_SECRET`: Secret key for JWT authentication.
- `DEFAULT_USER_NAME`: Default username for the initial user.
- `DEFAULT_USER_PASSWORD`: Default password for the initial user.
- `MONGO_URI`: MongoDB connection URI.
- `GOOGLE_APPS_SCRIPT_URL`: URL to Google script, get this from Wall of Wonders Trello backlog.

## API Endpoints

### Authentication

- `POST /auth/login`: Authenticate a user and return a JWT token.

### Secure Routes

- `GET /secure/proxy`: Fetch data from Google Apps Script.
