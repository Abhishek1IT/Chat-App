import { useEffect, useState, useContext } from "react";
import { getAllUsers } from "../../api/userApi";
import "../../styles/UserList.css";
import { useNavigate } from "react-router-dom";
import { SocketContext } from "../../context/SocketContext";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const socketContext = useContext(SocketContext);
  const onlineUsers = socketContext && socketContext.onlineUsers ? socketContext.onlineUsers : [];

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsers();
        setUsers(data.users || []);
      } catch {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    navigate("/chat/" + user._id);
  };

  // Always show AI Chatbot at the top
  const aiChatbot = {
    _id: "bot",
    name: "AI Chatbot",
    isBot: true
  };
  const allUsers = [aiChatbot, ...users];

  return (
    <div className="user-list-container">
      <div className="user-list-header">All Users</div>
      <div className="user-list-items">
        {loading ? (
          <div className="user-list-empty">Loading users...</div>
        ) : allUsers.length === 0 ? (
          <div className="user-list-empty">No users found.</div>
        ) : (
          allUsers.map((user) => (
            <div className="user-list-item" key={user._id} onClick={() => handleUserClick(user)}>
              <div className={user.isBot ? "user-avatar ai-chatbot" : "user-avatar"}>
                {user.isBot ? (
                  <span></span>
                ) : user.avatar ? (
                  <img src={user.avatar} alt={user.name} style={{ width: 38, height: 38, borderRadius: "50%" }} />
                ) : (
                  user.name[0].toUpperCase()
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-status">
                  {user.isBot
                    ? "Online"
                    : (onlineUsers && onlineUsers.includes(user._id) ? "Online" : "Offline")}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}