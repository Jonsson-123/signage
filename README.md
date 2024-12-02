# Signage

A series of web applications that provide various functionalities including user authentication, feedback collection, and displaying timetables for public transportation.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [License](#license)

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
    ```

2. Start the backend server:
    ```sh
    cd backend
    npm start
    ```



## Environment Variables

The following environment variables need to be set in the `.env` file in the `backend` directory:

- `JWT_SECRET`: Secret key for JWT authentication.
- `DEFAULT_USER_NAME`: Default username for the initial user.
- `DEFAULT_USER_PASSWORD`: Default password for the initial user.
- `MONGO_URI`: MongoDB connection URI.

## API Endpoints

### Authentication

- `POST /auth/login`: Authenticate a user and return a JWT token.

### Secure Routes

- `GET /secure/proxy`: Fetch data from Google Apps Script.

