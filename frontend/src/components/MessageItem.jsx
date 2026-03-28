import "../styles/ChatWindow.css";

export default function MessageItem({ msg, isMine }) {
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

  return (
    <div className={`message-item${isMine ? " mine" : ""}`}>
      <div className={`message-bubble${isMine ? " mine" : ""}`}>
        {isMine && <div className="message-you">You</div>}
        {msg.messageType === "text" ? msg.message : renderFile()}
        {isMine && (
          <div className="message-status" style={{ fontSize: 10, color: "#888", marginTop: 2, textAlign: "right" }}>
            {msg.status === "seen"
              ? "Seen"
              : msg.status === "delivered"
              ? "Delivered"
              : "Sent"}
          </div>
        )}
      </div>
    </div>
  );
}