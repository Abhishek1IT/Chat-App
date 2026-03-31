import { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { lodeMessages, accessChat } from "../../api/chatApi";
import api from "../../api/axios";
import { getAllUsers } from "../../api/userApi";
import { sendMessageAPI } from "../../api/messageApi";
import MessageItem from "../../components/MessageItem";
import FilePreview from "../../components/FilePreview";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import "../../styles/ChatWindow.css";

export default function ChatWindow() {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [chatUser, setChatUser] = useState(null);
  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch chatId (real chat _id) and join room, and fetch chat user info
  useEffect(() => {
    const fetchChatIdAndJoin = async () => {
      if (socket && id && user?._id) {
        try {
          const { data } = await accessChat({ userId: id });
          if (data && data._id) {
            setChatId(data._id);
            socket.emit("join", { chatId: data._id });
          }
        } catch {}
      }
    };
    fetchChatIdAndJoin();

    // Fetch chat user info
    const fetchChatUser = async () => {
      if (id && user?._id) {
        try {
          const { data } = await getAllUsers();
          if (data && data.users) {
            const found = data.users.find((u) => u._id === id);
            setChatUser(found || null);
          }
        } catch {
          setChatUser(null);
        }
      }
    };
    fetchChatUser();
  }, [socket, id, user]);

  useEffect(() => {
    if (!socket || !chatId) return;
    const handleTyping = ({ chatId: typingChatId, userId: typingUserId }) => {
      if (typingChatId === chatId && typingUserId !== user?._id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };
    socket.on("typing", handleTyping);
    return () => {
      socket.off("typing", handleTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [socket, chatId, user]);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const { data } = await lodeMessages(id);
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [id]);

  useEffect(() => {
    if (!socket) return;
    const handleReceiveMessage = (msg) => {
      const normalizedMsg = {
        ...msg,
        senderId: typeof msg.senderId === 'object' && msg.senderId !== null ? msg.senderId._id : msg.senderId,
        receiverId: typeof msg.receiverId === 'object' && msg.receiverId !== null ? msg.receiverId._id : msg.receiverId,
      };
      // Only add if message is for this chat
      if (
        (normalizedMsg.senderId && normalizedMsg.senderId === id) ||
        (normalizedMsg.receiverId && normalizedMsg.receiverId === id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === normalizedMsg._id)) return prev;
          return [...prev, normalizedMsg];
        });
      }
    };
    // Handle seen status
    const handleMessagesSeen = ({ senderId, receiverId }) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m.senderId) === String(senderId) &&
          String(m.receiverId) === String(receiverId)
            ? { ...m, status: "seen" }
            : m,
        ),
      );
    };
    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("messagesSeen", handleMessagesSeen);
    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("messagesSeen", handleMessagesSeen);
    };
  }, [socket, id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input && !file) return;

    // Bot chat logic
    if (id === "bot") {
      setMessages(prev => {
        const updated = [...prev, { sender: "me", message: input, messageType: "text" }];
        return updated;
      });
      try {
        const res = await api.post("/bot/message", { message: input });
        const botReply = res?.data?.reply?.trim();
        setMessages(prev => {
          const updated = [...prev, {
            sender: "bot",
            message: botReply && botReply !== "" ? botReply : "Sorry, I could not process that right now. Please try again.",
            messageType: "text"
          }];
          return updated;
        });
      } catch {
        setMessages(prev => {
          const updated = [...prev, { sender: "bot", message: "Sorry, I could not process that right now. Please try again.", messageType: "text" }];
          return updated;
        });
      }
      setInput("");
      setFile(null);
      return;
    }

    // Normal user chat logic
    const formData = new FormData();
    formData.append("receiverId", id);
    formData.append("message", input);
    if (file) formData.append("file", file);
    try {
      const { data } = await sendMessageAPI(formData);
      if (data && data.message) {
        setMessages((prev) => {
          // Remove any placeholder file message (with no _id) before adding the real one
          const filtered = prev.filter((m) => m._id || m.messageType !== "file");
          if (filtered.some((m) => m._id === data.message._id)) return filtered;
          return [...filtered, data.message];
        });
      }
      setInput("");
      setFile(null);
    } catch {}
  };

  // Emit typing event when user types
  const handleInputChange = (e) => {
    setInput(e.target.value);
    if (socket && chatId && e.target.value) {
      socket.emit("typing", { chatId, userId: user?._id });
    }
  };

  return (
    <div className="chat-window-container">
      <div className="chat-window-header">
        {chatUser ? chatUser.name : "Chat"}
      </div>
      <div className="chat-window-messages">
        {loading ? (
          <div>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div>No messages yet. Say hello!</div>
        ) : (
          null ||
          messages.map((msg, idx) => (
            <MessageItem
              key={msg._id || msg.id || msg.sender+"-"+idx}
              msg={msg}
              isMine={msg.sender === "me" || String((msg.senderId && msg.senderId._id) ? msg.senderId._id : msg.senderId) === String(user?._id)}
            />
          ))
        )}
        {isTyping && <div className="typing-indicator">typing...</div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-window-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={input}
          onChange={handleInputChange}
        />
        <input
          type="file"
          style={{ display: "none" }}
          id="file-upload"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <label
          htmlFor="file-upload"
          style={{ marginRight: 8, cursor: "pointer" }}
        >
          📎
        </label>
        <button type="submit">Send</button>
      </form>
      <FilePreview file={file} onRemove={() => setFile(null)} />
    </div>
  );
}