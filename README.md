# Chat App (Full Stack)

This project is a full-stack real-time chat application with user authentication, real-time messaging, and an integrated AI chatbot.

---

## API Endpoints & Capabilities

### User & Auth APIs (`/api/auth`)
- **POST `/register`** — Register a new user.
- **POST `/login`** — Login and get a JWT token.
- **GET `/users`** — Get all users (requires login).
- **GET `/profile`** — Get your profile info (requires login).

### Password APIs (`/api/forgotpassword`)
- **POST `/forgotpassword`** — Request a password reset email.
- **PUT `/resetpassword/:token`** — Reset password using the token.

### Chat APIs (`/api/chats`)
- **POST `/access`** — Start or get a one-to-one chat (requires login).
- **POST `/group`** — Create a group chat (requires login).
- **PUT `/addadmin`** — Make a user admin in a group (admin only).
- **PUT `/removeadmin`** — Remove admin rights from a user (admin only).
- **PUT `/adminadduser`** — Admin adds a user to a group (admin only).
- **PUT `/adminremoveuser`** — Admin removes a user from a group (admin only).
- **PUT `/leavegroup`** — Leave a group chat.
- **GET `/my`** — Get all your chats (requires login).
- **GET `/:userId`** — Get messages for a chat (requires login).
- **DELETE `/group/:groupId`** — Delete a group (admin only).

### Message APIs (`/api/message`)
- **POST `/send`** — Send a message (with optional file upload).
- **PUT `/seen`** — Mark messages as seen.
- **PATCH `/edit/:id`** — Edit a message.
- **DELETE `/delete/:id`** — Delete a message.

### AI Bot API (`/api/bot`)
- **POST `/message`** — Send a message to the AI bot (requires login).

---

## What Can Users Do?

- Register, login, and manage their profile.
- Start private chats with any user.
- Create group chats, add/remove users (if admin), and assign admin rights.
- Only group admins can delete a group or manage other users in the group.
- Send, edit, and delete messages (including files/images/videos).
- See real-time typing indicators and message delivery status.
- Reset their password via email if forgotten.
- Chat with the built-in AI chatbot (Gemini) at any time.

---

---

## Project Overview

### Backend (Node.js/Express, MongoDB)
- **User Authentication:** Register, login, JWT-based auth, password reset via email.
- **Chat System:**
   - One-to-one and group chats (with group admin management).
   - Real-time messaging using Socket.IO.
   - File uploads (images, videos, documents) in chat.
   - Message editing and deletion.
   - Group management: add/remove users, admin controls, leave/delete group (admin only).
- **AI Chatbot:** Google Gemini-powered bot always available as a chat participant.
- **Email Integration:** Nodemailer for password reset.
- **Tech Stack:** Express, Mongoose, Socket.IO, JWT, Multer, Nodemailer, Google Generative AI.

**Key Backend Folders:**
- `controllers/` — Route logic for auth, chat, bot, user, password, etc.
- `models/` — Mongoose schemas for User, Chat, Message, Chatbot.
- `routes/` — API endpoints for auth, chat, bot, password, etc.
- `middleware/` — Auth middleware for route protection.
- `socket/` — Socket.IO server logic.
- `uploads/` — File upload handling.
- `utils/` — Token generation, email sending, helpers.

### Frontend (React)
- **Authentication:** Register, login, profile, password reset.
- **Chat UI:**
   - User list, chat list, chat window, group manager.
   - Real-time updates and typing indicator.
   - File and image preview in chat.
   - Group creation, add/remove users, admin controls.
- **AI Chatbot:** Chat with Gemini bot like a user.
- **State Management:** React Context for auth and socket.
- **API Layer:** Organized in `src/api/` for all backend calls.
- **Component Structure:** Modular components for chat, user, group, messages, modals, etc.
- **Styling:** CSS modules in `src/styles/`.

**Key Frontend Folders:**
- `src/pages/` — Page-level components (auth, chat, password, etc.)
- `src/components/` — UI components (chat, user, group, modals, etc.)
- `src/api/` — API functions for backend communication.
- `src/context/` — React Context for auth and socket.
- `src/utils/` — Local storage and helpers.
- `src/styles/` — CSS files for all UI parts.

---

---

## Features
- AI Chatbot (Gemini): Always visible at the top of the Users list. Chat with the bot just like a user!
- All chat access is via the Users page for simple, intuitive navigation.
- Clean UI: All styles are in CSS files, no inline styles for avatars or bot.
- Focused Navbar: Only "Users", "Profile", and "Logout".
- Real-time typing indicator: see "typing..." when the other user is typing in the same chat window.
- Only the group admin can delete a group (group deletion is restricted to admins).

---

## Quick Start (Manual)
1. Clone the repository and navigate to the project root.
2. Install dependencies for both backend and frontend:
   ```bash
   cd backend
   npm install
   cd ../frontend
   npm install
   ```
3. Start the backend server:
   ```bash
   cd backend
   npm start
   ```
4. Start the frontend server:
   ```bash
   cd frontend
   npm start
   ```
5. Open the app in your browser:
   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Backend: [http://localhost:5000](http://localhost:5000)

---

## AI Chatbot Usage
- Go to the **Users** page (default after login)
- The **AI Chatbot** will always appear at the top of the user list
- Click on "AI Chatbot" to start chatting with the bot
- The bot uses Google Gemini (API key required in backend `.env`)

---

## Environment Variables

### Backend (`backend/.env` example):
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_password
FRONTEND_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (`frontend/.env` example):
```
REACT_APP_SOCKET_URL=http://localhost:5002
REACT_APP_API_URL=/api
```

---

## Folder Structure

- `frontend/` — React app
- `backend/` — Node.js/Express API

### Backend Structure
- `index.js`, `app.js`, `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `socket/`, `uploads/`, `utils/`

### Frontend Structure
- `public/`, `src/` (with `pages/`, `components/`, `api/`, `context/`, `styles/`, `utils/`)

---

## Notes
- Make sure MongoDB and both servers are running 
- CORS is configured to allow requests from the frontend
- For best experience, use the app in two browser windows with different users
- The AI Chatbot is always available at the top of the Users list after login
- Only the group admin can delete a group; regular users cannot delete groups.