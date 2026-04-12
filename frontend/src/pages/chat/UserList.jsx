import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { getAllUsers } from "../../api/userApi";
import "../../styles/UserList.css";
import { useNavigate } from "react-router-dom";

export default function UserList({ onUserSelect }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    if (onUserSelect) {
      onUserSelect(user._id);
    } else {
      navigate("/chat/" + user._id);
    }
  };

  const { user: currentUser } = useContext(AuthContext);
  const filteredUsers = users.filter((u) => !u.isBot && String(u._id) !== String(currentUser?._id));

  const showOnlyAIChatbot = filteredUsers.length === 0;
  return (
    <div className={`user-list-container${showOnlyAIChatbot ? ' ai-chatbot-only' : ''}`}>
      <div className="user-list-header">All Users</div>
      <div className="user-list-items">
        {/* Fixed AI Chatbot button */}
        <div className="user-list-item ai-chatbot-fixed" onClick={() => navigate("/chat/bot")}> 
          <div className="user-avatar ai-chatbot">🤖</div>
          <div className="user-info">
            <div className="user-name">AI Chatbot</div>
          </div>
        </div>
        {/* Normal users */}
        {loading ? (
          <div className="user-list-empty">Loading users...</div>
        ) : filteredUsers.length === 0 ? null : (
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
                <div className="user-last-message">
                  {user.lastMessage ? (
                    <>
                      <span className="user-last-message-text">{user.lastMessage}</span>
                      {user.lastMessageType === "text" && user.lastMessageSenderId && currentUser && (
                        <span className="user-last-message-status">
                          {user.lastMessageSenderId === currentUser._id && (
                            user.lastMessageStatus === "seen" ? (
                              <span className="user-seen-icon">✔✔</span>
                            ) : user.lastMessageStatus === "delivered" ? (
                              <span className="user-delivered-icon">✔✔</span>
                            ) : (
                              <span className="user-sent-icon">✔</span>
                            )
                          )}
                        </span>
                      )}
                    </>
                  ) : " "}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}