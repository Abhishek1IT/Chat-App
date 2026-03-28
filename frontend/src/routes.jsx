import {
	 Routes, 
	 Route, 
	 Navigate 
	} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";
import UserList from "./pages/chat/UserList";
import ChatList from "./pages/chat/ChatList";
import ChatWindow from "./pages/chat/ChatWindow";
import ForgotPassword from "./pages/password/ForgotPassword";
import ResetPassword from "./pages/password/ResetPassword";

export default function AppRoutes({ user }) {
	return (
		   <Routes>
			   {!user ? (
				   <>
					   <Route path="/register" element={<Register />} />
					   <Route path="/login" element={<Login />} />
					   <Route path="/forgot-password" element={<ForgotPassword />} />
					   <Route path="/resetpassword/:token" element={<ResetPassword />} />
					   <Route path="*" element={<Navigate to="/register" replace />} />
				   </>
			   ) : (
				   <>
					   <Route path="/users" element={<UserList />} />
					   <Route path="/chats" element={<ChatList />} />
					   <Route path="/chat/:id" element={<ChatWindow />} />
					   <Route path="/profile" element={<Profile />} />
					   <Route path="*" element={<Navigate to="/users" replace />} />
				   </>
			   )}
		   </Routes>
	);
}
