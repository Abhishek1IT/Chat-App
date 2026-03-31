# Chat App (Full Stack)

This project is a full-stack real-time chat application with user authentication, real-time messaging, and an integrated AI chatbot.

---

## Features
- AI Chatbot (Gemini): Always visible at the top of the Users list. Chat with the bot just like a user!
- All chat access is via the Users page for simple, intuitive navigation.
- Clean UI: All styles are in CSS files, no inline styles for avatars or bot.
- Focused Navbar: Only "Users", "Profile", and "Logout".
- Docker Compose: One command to run backend, frontend, and MongoDB together.
- Real-time typing indicator: see "typing..." when the other user is typing in the same chat window.

---

## Quick Start (Docker Compose)
1. Clone the repository and navigate to the project root.
2. Build and run all services:
   ```bash
   docker-compose up --build
   ```
3. Open the app in your browser:
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
REACT_APP_SOCKET_URL=http://localhost:5000
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
- Make sure MongoDB and both servers are running (or use Docker Compose)
- CORS is configured to allow requests from the frontend
- For best experience, use the app in two browser windows with different users
- The AI Chatbot is always available at the top of the Users list after login
