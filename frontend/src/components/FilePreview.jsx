export default function FilePreview({ file, onRemove }) {
  if (!file) return null;

  return (
    <div
      style={{
        padding: "8px",
        background: "#f2f2f2",
        marginTop: "10px",
        borderRadius: "5px",
      }}
    >
      <span>📄 {file.name}</span>
      <button
        onClick={onRemove}
        style={{
          marginLeft: "10px",
          padding: "2px 8px",
          cursor: "pointer",
          background: "red",
          color: "white",
          border: "none",
          borderRadius: "4px",
        }}
      >
        Remove
      </button>
    </div>
  );
}