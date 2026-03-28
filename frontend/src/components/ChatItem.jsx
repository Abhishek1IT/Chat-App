export default function ChatItem({ chat, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: "12px",
        borderBottom: "1px solid #eee",
        cursor: "pointer",
      }}
    >
      <div style={{ fontWeight: "bold" }}>{chat.user?.name}</div>
      <div style={{ fontSize: "14px", opacity: 0.7 }}>
        {chat.lastMessage?.message || "No messages yet"}
      </div>
    </div>
  );
}