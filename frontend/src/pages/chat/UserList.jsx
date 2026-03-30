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

  return (
    <div className="user-list-container">
      <div className="user-list-header">All Users</div>
      <div className="user-list-items">
        {loading ? (
          <div className="user-list-empty">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="user-list-empty">No users found.</div>
        ) : (
          users.map((user) => (
            <div className="user-list-item" key={user._id} onClick={() => handleUserClick(user)}>
              <div className="user-avatar">
                {user.isBot ? (
                  user.name[0].toUpperCase()
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
