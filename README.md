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
   - Typing indicator (see when the other user is typing)
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
**Features:**
   - User registration and login (JWT authentication)
   - User profile and list
   - Real-time chat with Socket.IO
   - Typing indicator (shows "typing..." when the other user is typing)
   - AI chatbot integration (Gemini, via `/api/bot/message`)
   - Password reset via email
   - File uploads for chat messages
   - Secure routes with middleware
   - Message storage in MongoDB
## Typing Indicator Feature

This app supports a real-time typing indicator:

- When one user is typing in a chat, the other user will see a "typing..." message below the chat messages.
- This works only if both users are in the same chat window at the same time.
- The indicator disappears after 2 seconds of inactivity.

**How to test:**
1. Open the app in two different browsers (or incognito windows).
2. Log in with two different users.
3. Open the same chat between the two users in both windows.
4. When one user types, the other will see "typing..." in real time.


**Dependencies:**
   - express, mongoose, socket.io, bcrypt, jsonwebtoken, multer, nodemailer, dotenv
   - @google/generative-ai (Gemini integration)

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
   FRONTEND_URL=http://localhost:3000
   # For AI Chatbot (Gemini)
   GEMINI_API_KEY=your_gemini_api_key
   ```
---

## AI Chatbot (Gemini) Integration

This app supports an AI chatbot using Google Gemini. To enable the AI bot:

1. Get a Gemini API key from Google AI Studio or your provider.
2. Add `GEMINI_API_KEY=your_gemini_api_key` to your `backend/.env` file.
3. Restart the backend server after updating `.env`.
4. In the frontend, start a chat with the user ID `bot` to talk to the AI.

If the API key is missing or invalid, the bot will reply: `Sorry, I could not process that right now. Please try again.`

---
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

### Backend Structure
- `index.js` — Entry point, starts server and attaches socket.io
- `app.js` — Express app, CORS, routes, static files
- `config/db.js` — MongoDB connection
- `controllers/` — Route controllers:
   - `authController.js` — User authentication
   - `botController.js` — Gemini AI chatbot logic
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
   - `Chatbot.js` — (for future AI features)
- `routes/` — API routes:
   - `authRoute.js` — Auth endpoints
   - `botRoute.js` — AI chatbot endpoint
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

## Frontend (React)

**Dependencies:**
   - react, react-dom, react-router-dom, socket.io-client, axios
   - @testing-library/react, @testing-library/jest-dom, web-vitals

**Structure:**
- `public/` — Static assets (favicon, logos, manifest, robots.txt)
- `src/`
   - `App.jsx`, `index.jsx` — Main entry points
   - `routes.jsx` — App routes
   - `pages/`
      - `auth/` — Login, Register, Profile
      - `chat/` — ChatList, ChatWindow, UserList
      - `password/` — ForgotPassword, ResetPassword
   - `components/` — UI components:
      - `ChatItem.jsx`, `FilePreview.jsx`, `Loader.jsx`, `MessageItem.jsx`
   - `api/` — API calls:
      - `authApi.js`, `axios.js`, `chatApi.js`, `messageApi.js`, `passwordApi.js`, `userApi.js`
   - `context/` — React context providers:
      - `AuthContext.jsx`, `SocketContext.jsx`
   - `styles/` — CSS files for each component/page
   - `utils/` — Local storage helpers

---

## Environment Variables

- Both frontend and backend use `.env` files for configuration.
- Backend `.env` now requires `GEMINI_API_KEY` for AI chatbot.
- Frontend `.env` example:
   ```env
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

---

## Testing

- No automated tests yet. `npm test` is a placeholder in both frontend and backend.

---

---

## Notes
- Make sure MongoDB and both servers are running.
- Update environment variables as needed for production.
- CORS is configured to allow requests from the frontend.
- For best experience, use the app in two browser windows with different users.
