import { useEffect, useRef, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { lodeMessages, accessChat } from "../../api/chatApi";
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
	const typingTimeoutRef = useRef(null);
	const messagesEndRef = useRef(null);


		// Fetch chatId (real chat _id) and join room
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
		}, [socket, id, user]);
	
	useEffect(() => {
		if (!socket || !chatId) return;
		const handleTyping = ({ chatId: typingChatId, userId: typingUserId }) => {
			// Only show typing if it's for this chat and not current user
			if (typingChatId === chatId && typingUserId !== user?._id) {
				setIsTyping(true);
				if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
				typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000); // 2s
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
			// Only add if message is for this chat
			if (
				(msg.senderId && (msg.senderId._id || msg.senderId) === id) ||
				(msg.receiverId && (msg.receiverId._id || msg.receiverId) === id)
			) {
				setMessages((prev) => {
					// Prevent duplicate messages
					if (prev.some((m) => m._id === msg._id)) return prev;
					return [...prev, msg];
				});
			}
		};
		// Handle seen status
		const handleMessagesSeen = ({ senderId, receiverId }) => {
			setMessages((prev) =>
				prev.map((m) =>
					String(m.senderId) === String(senderId) && String(m.receiverId) === String(receiverId)
						? { ...m, status: "seen" }
						: m
				)
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
		const formData = new FormData();
		formData.append("receiverId", id);
		formData.append("message", input);
		if (file) formData.append("file", file);
		try {
			await sendMessageAPI(formData);
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
			<div className="chat-window-header">Chat</div>
			<div className="chat-window-messages">
				{loading ? (
					<div>Loading messages...</div>
				) : messages.length === 0 ? (
					<div>No messages yet. Say hello!</div>
				) : (
					messages.map((msg, idx) => (
						<MessageItem
							key={msg._id || msg.id || idx}
							msg={msg}
							isMine={String(msg.senderId || msg.sender) === String(user?._id)}
						/>
					))
				)}
				   {isTyping && (
					   <div className="typing-indicator">
						   typing...
					   </div>
				   )}
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
				<label htmlFor="file-upload" style={{ marginRight: 8, cursor: "pointer" }}>
					📎
				</label>
				<button type="submit">Send</button>
			</form>
			<FilePreview file={file} onRemove={() => setFile(null)} />
		</div>
	);
}