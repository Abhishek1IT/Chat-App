/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api/userApi";
import { AuthContext } from "../../context/AuthContext";
import { myChats } from "../../api/chatApi";
import "../../styles/ChatList.css";

export default function ChatList() {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsers();
        setUsers((data?.users || []).filter((u) => u._id !== user._id));
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    const fetchChats = async () => {
      try {
        const { data } = await myChats();
        console.log('myChats API response:', data);
        const groupChats = (data || []).filter((c) => c.isGroupChat);
        console.log('Filtered group chats:', groupChats);
        setChats(groupChats);
      } catch (err) {
        console.error('Error fetching group chats:', err);
        setChats([]);
      }
    };
    fetchUsers();
    fetchChats();
  }, []);

  const handleUserClick = (u) => {
    navigate(`/chat/${u._id}`);
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">Users</div>
      <div className="chat-list-items">
        <div
          className="chat-list-item ai-chatbot"
          onClick={() => navigate("/chat/bot")}
        >
          <div className="chat-list-name">AI Chatbot</div>
        </div>
        {/* Normal users */}
        {loading ? (
          <div className="chat-list-empty">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="chat-list-empty">No users found.</div>
        ) : (
          users.map((u) => (
            <div
              key={u._id}
              className="chat-list-item"
              onClick={() => handleUserClick(u)}
            >
              <div className="chat-list-avatar">{u.name[0]}</div>
              <div className="chat-list-name">{u.name}</div>
            </div>
          ))
        )}
        {/* Group chats */}
        {chats.map((g) => (
          <div
            key={g._id}
            className="chat-list-item group-chat"
            onClick={() => navigate(`/chat/${g._id}`)}
          >
            <div className="chat-list-avatar">👥</div>
            <div className="chat-list-name">{g.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
