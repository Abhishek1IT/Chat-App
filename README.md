# Chat App (Full Stack)

This project is a full-stack real-time chat application with user authentication, chat, and messaging features.

---

## Frontend (React)

- **Location:** `frontend/`
- **Tech:** React, Context API, Axios, Socket.IO-client
- **Features:**
  - User registration and login
  - JWT authentication
  - View all users (except yourself)
  - Real-time chat with other users
  - Profile management
  - Password reset (forgot/reset)
  - Responsive UI

### Getting Started (Frontend)
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file:
   ```env
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```
4. Start the development server:
   ```bash
   npm start
   # or
   yarn start
   ```

The app will run at [http://localhost:3000](http://localhost:3000).

---

## Backend (Node.js/Express)

- **Location:** `backend/`
- **Tech:** Node.js, Express, MongoDB, Mongoose, Socket.IO
- **Features:**
  - User registration and login (JWT authentication)
  - User profile and list
  - Real-time chat with Socket.IO
  - Message storage in MongoDB
  - Password reset via email
  - File uploads for chat messages
  - Secure routes with middleware

### Getting Started (Backend)
1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```
3. Create a `.env` file with the following variables:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   CLIENT_URL=http://localhost:3000
   ```
4. Start the backend server:
   ```bash
   npm start
   # or
   yarn start
   ```

The server will run at [http://localhost:5000](http://localhost:5000).

---

## Folder Structure

- `frontend/` — React app
- `backend/` — Node.js/Express API

### Frontend
- `src/pages/` — Main pages:
   - `auth/` — Login, Register, Profile
   - `chat/` — ChatList, ChatWindow, UserList
   - `password/` — ForgotPassword, ResetPassword
- `src/components/` — UI components:
   - `ChatItem.jsx` — Chat list item
   - `FilePreview.jsx` — File preview before sending
   - `Loader.jsx` — Loading spinner
   - `MessageItem.jsx` — Single message bubble (shows status)
- `src/api/` — API calls:
   - `authApi.js` — Auth requests
   - `axios.js` — Axios instance
   - `chatApi.js` — Chat requests
   - `messageApi.js` — Message send/seen
   - `passwordApi.js` — Password reset
   - `userApi.js` — User info
- `src/context/` — React context providers:
   - `AuthContext.jsx` — Auth state
   - `SocketContext.jsx` — Socket connection and online users
- `src/styles/` — CSS files for each component/page
- `src/utils/storage.js` — Local storage helpers

### Backend
- `index.js` — Entry point, starts server and attaches socket.io
- `app.js` — Express app, CORS, routes, static files
- `config/db.js` — MongoDB connection
- `controllers/` — Route controllers:
   - `authController.js` — User authentication
   - `chatController.js` — Chat logic
   - `forgotPassController.js` — Password reset
   - `sendMessageController.js` — Message send/deliver/seen
   - `userController.js` — User profile/info
- `middleware/` — Auth and other middleware:
   - `authMiddleware.js` — JWT authentication
- `models/` — Mongoose models:
   - `User.js` — User data
   - `Chat.js` — Chat data
   - `Message.js` — Message data
- `routes/` — API routes:
   - `authRoute.js` — Auth endpoints
   - `chatRoute.js` — Chat endpoints
   - `frogotPassRoute.js` — Password reset endpoints
   - `sendMessageRoute.js` — Message send/seen endpoints
- `socket/` — Socket.IO logic:
   - `socket.js` — Real-time events (user online, message delivery, seen)
- `uploads/` — File uploads
- `utils/` — Utility functions:
   - `genrateToken.js` — JWT token
   - `sendEmail.js` — Email sending

---

## Notes
- Make sure MongoDB and both servers are running.
- Update environment variables as needed for production.
- CORS is configured to allow requests from the frontend.
- For best experience, use the app in two browser windows with different users.
