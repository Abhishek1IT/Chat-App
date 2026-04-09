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

  const filteredUsers = users.filter((u) => !u.isBot);

  return (
    <div className="user-list-container">
      <div className="user-list-header">All Users</div>
      <div className="user-list-items">
        {/* Fixed AI Chatbot button */}
        <div className="user-list-item ai-chatbot-fixed" onClick={() => navigate("/chat/bot")}> 
          <div className="user-avatar ai-chatbot">🤖</div>
          <div className="user-info">
            <div className="user-name">AI Chatbot</div>
            <div className="user-status">Online</div>
          </div>
        </div>
        {/* Normal users */}
        {loading ? (
          <div className="user-list-empty">Loading users...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="user-list-empty">No users found.</div>
        ) : (
          filteredUsers.map((user) => (
            <div className="user-list-item" key={user._id} onClick={() => handleUserClick(user)}>
              <div className="user-avatar">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="user-avatar-img" />
                ) : (
                  user.name[0].toUpperCase()
                )}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-status">
                  {onlineUsers && onlineUsers.includes(user._id) ? "Online" : "Offline"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}