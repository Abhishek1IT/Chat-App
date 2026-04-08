import "../styles/ChatWindow.css";

export default function MessageItem({ msg, isMine, isSelected }) {
  const fileName =
    msg.fileName ||
    msg.originalName ||
    (msg.fileUrl ? msg.fileUrl.split("/").pop() : "File");

  const getFileExtension = (url = "") => url.split(".").pop().toLowerCase();

  const renderFile = () => {
    // Image Check
    if (msg.mimetype?.startsWith("image/")) {
      return <img src={msg.fileUrl} alt="sent-img" className="message-image" />;
    }

    // Video Check
    if (msg.mimetype?.startsWith("video/")) {
      return (
        <video controls className="message-video">
          <source src={msg.fileUrl} type={msg.mimetype} />
        </video>
      );
    }

    const ext = getFileExtension(msg.fileUrl);

    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext)) {
      return <img src={msg.fileUrl} alt="sent-img" className="message-image" />;
    }

    if (["mp4", "webm", "ogg", "mkv", "avi"].includes(ext)) {
      return (
        <video controls className="message-video">
          <source src={msg.fileUrl} type={`video/${ext}`} />
        </video>
      );
    }

    return (
      <a
        href={msg.fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="message-download-link"
      >
        📎 {fileName}
      </a>
    );
  };

  // Bot message: left, icon; User: right
  const isBot = msg.sender === "bot";
  // Format timestamp
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  // Status icon logic
  const getStatusIcon = (status) => {
    if (status === "seen") {

      return <span style={{ color: '#2196f3' }}>✔✔</span>;
    } else if (status === "delivered") {

      return <span style={{ color: '#888' }}>✔✔</span>;
    } else {
      
      return <span style={{ color: '#888' }}>✔</span>;
    }
  };
  return (
    <div
      className={`message-item${isMine ? " mine" : ""}${isBot ? " bot-message" : ""}${isSelected ? " selected-message" : ""}`}
      style={{ justifyContent: isBot ? "flex-start" : isMine ? "flex-end" : "flex-start", border: isSelected ? '2px solid #2196f3' : undefined }}
    >
      <div className={`message-bubble${isMine ? " mine" : ""}${isBot ? " bot-bubble" : ""}`}>
        {isBot && <span style={{ marginRight: 6 }}>🤖</span>}
        {isMine && !isBot && <div className="message-you">You</div>}
        {msg.messageType === "text" ? msg.message : renderFile()}
        <div className="message-meta" style={{ fontSize: 10, color: "#888", marginTop: 2, textAlign: isMine ? "right" : "left", display: "flex", justifyContent: isMine ? "flex-end" : "flex-start", gap: 8, alignItems: "center" }}>
          <span>{formatTime(msg.createdAt)}</span>
          {isMine && !isBot && (
            <span className="message-status" style={{ marginLeft: 4 }}>
              {getStatusIcon(msg.status)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}