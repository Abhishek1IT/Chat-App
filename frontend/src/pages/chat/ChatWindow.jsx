/* eslint-disable no-use-before-define */
import { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";
import { accessChat, loadMessages, myChats } from "../../api/chatapi";
import { getAllUsers } from "../../api/userApi";
import { sendMessageAPI, deleteMessageAPI, editMessageAPI } from "../../api/messageApi";
import MessageItem from "../../components/MessageItem";
import FilePreview from "../../components/FilePreview";
import { AuthContext } from "../../context/AuthContext";
import { SocketContext } from "../../context/SocketContext";
import "../../styles/ChatWindow.css";

export default function ChatWindow() {
  const { id } = useParams();
  const [isGroup, setIsGroup] = useState(false);
  const [groupInfo, setGroupInfo] = useState(null);
  console.log("ChatWindow loaded", id);
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
  // Edit message state
  const [editingMsg, setEditingMsg] = useState(null);
  // Selected message for header actions
  const [selectedMsg, setSelectedMsg] = useState(null);

  // Handler: Edit message (from header)
  const handleEditMessage = (e) => {
    if (e) e.preventDefault();
    if (!selectedMsg) return;
    setEditingMsg(selectedMsg);
    setInput(selectedMsg.message);
    setSelectedMsg(null);
  };

  // Handler: Delete message (from header)
  const handleDeleteMessage = async (e) => {
    if (e) e.preventDefault();
    if (!selectedMsg) return;
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessageAPI(selectedMsg._id);
      setMessages((prev) => prev.filter((m) => m._id !== selectedMsg._id));
      setSelectedMsg(null);
    } catch (err) {
      alert("Failed to delete message");
    }
  };

  // Fetch chatId (real chat _id) and join room, and fetch chat user info or group info
  // Always join the group/user chat room on mount and id change
  useEffect(() => {
    const fetchChatOrGroup = async () => {
      if (!socket || !id || !user?._id) return;
      // Check if id is a group
      try {
        const { data } = await myChats();
        const group = (data || []).find((g) => g._id === id && g.isGroupChat);
        if (group) {
          setIsGroup(true);
          setGroupInfo(group);
          setChatId(group._id);
          setChatUser(null);
          socket.emit("join", { chatId: group._id });
        } else {
          setIsGroup(false);
          setGroupInfo(null);
          // Normal user chat
          const { data: chatData } = await accessChat({ userId: id });
          if (chatData && chatData._id) {
            setChatId(chatData._id);
            socket.emit("join", { chatId: chatData._id });
          }
          // Fetch chat user info
          const { data: usersData } = await getAllUsers();
          if (usersData && usersData.users) {
            const found = usersData.users.find((u) => u._id === id);
            setChatUser(found || null);
          }
        }
      } catch {
        setIsGroup(false);
        setGroupInfo(null);
      }
    };
    fetchChatOrGroup();
  }, [socket, id, user]);

  // Re-join chat room if socket reconnects (ensures group messages always received)
  useEffect(() => {
    if (!socket || !chatId) return;
    const handleReconnect = () => {
      socket.emit("join", { chatId });
    };
    socket.on("connect", handleReconnect);
    return () => {
      socket.off("connect", handleReconnect);
    };
  }, [socket, chatId]);

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
        // For group, fetch messages by groupId, for user, by userId
        const fetchId = id;
        const { data } = await loadMessages(fetchId);
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

    // Edit mode
    if (editingMsg) {
      console.log("[Edit API] editingMsg:", editingMsg);
      try {
        const { data } = await editMessageAPI(editingMsg._id, { message: input });
        setMessages((prev) => prev.map((m) => m._id === editingMsg._id ? data.message : m));
        setEditingMsg(null);
        setInput("");
        setFile(null);
      } catch {
        alert("Failed to edit message");
      }
      return;
    }

    // Bot chat logic
    if (id === "bot") {
      console.log("[BOT] Sending message to bot:", input);
      setMessages(prev => {
        const updated = [...prev, { sender: "me", message: input, messageType: "text" }];
        return updated;
      });
      try {
        const res = await api.post("/bot/message", { message: input });
        console.log("[BOT] API response:", res);
        const botReply = res?.data?.reply?.trim();
        setMessages(prev => {
          const updated = [...prev, {
            sender: "bot",
            message: botReply && botReply !== "" ? botReply : "Sorry, I could not process that right now. Please try again.",
            messageType: "text"
          }];
          return updated;
        });
      } catch (err) {
        console.error("[BOT] API error:", err);
        setMessages(prev => {
          const updated = [...prev, { sender: "bot", message: "Sorry, I could not process that right now. Please try again.", messageType: "text" }];
          return updated;
        });
      }
      setInput("");
      setFile(null);
      return;
    }

    // Normal user or group chat logic
    const formData = new FormData();
    if (isGroup) {
      formData.append("groupId", id);
    } else {
      formData.append("receiverId", id);
    }
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

  // Format last seen
  const formatLastSeen = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 60000); // minutes
    if (diff < 1) return "just now";
    if (diff < 60) return `${diff} min ago`;
    if (diff < 1440) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return date.toLocaleDateString();
  };

  return (
    <div className="chat-window-container">
      <div className="chat-window-header chat-window-header-flex">
        <div>{isGroup && groupInfo ? groupInfo.name : chatUser ? chatUser.name : "Chat"}</div>
        <div className="chat-header-right">
          {chatUser && !chatUser.isBot && (
            <div className="chat-header-lastseen">
              {chatUser.isOnline ? "Online" : chatUser.lastSeen ? `Last seen: ${formatLastSeen(chatUser.lastSeen)}` : "Offline"}
            </div>
          )}
          {selectedMsg && (
            <div className="chat-header-actions">
              <button className="chat-header-btn edit" onClick={handleEditMessage}>✏️</button>
              <button className="chat-header-btn delete" onClick={handleDeleteMessage}>🗑️</button>
              <button className="chat-header-btn cancel" onClick={() => setSelectedMsg(null)}>❌</button>
            </div>
          )}
        </div>
      </div>
      <div className="chat-window-messages">
        {loading ? (
          <div>Loading messages...</div>
        ) : messages.length === 0 ? (
          <div>No messages yet. Say hello!</div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.sender === "me" || String((msg.senderId && msg.senderId._id) ? msg.senderId._id : msg.senderId) === String(user?._id);
            const isSelected = selectedMsg && selectedMsg._id === msg._id;
            return (
              <div
                key={msg._id || msg.id || msg.sender+"-"+idx}
                className={`chat-message-row${isMine ? " mine" : ""}${isSelected ? " selected-message" : ""}`}
                onClick={() => isMine && setSelectedMsg(isSelected ? null : msg)}
              >
                <MessageItem
                  msg={msg}
                  isMine={isMine}
                  isSelected={isSelected}
                />
              </div>
            );
          })
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
          className="file-upload-label"
        >
          📎
        </label>
        <button type="submit">Send</button>
      </form>
      <FilePreview file={file} onRemove={() => setFile(null)} />
    </div>
  );
}