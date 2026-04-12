import { useState, useEffect } from "react";
import { getAllUsers } from "../api/userApi";
import { createGroupChat } from "../api/chatApi.js";

export default function CreateGroupModal({ onClose, onGroupCreated }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllUsers().then(({ data }) => setUsers(data.users || []));
  }, []);

  const handleCreate = async () => {
    if (!name || selected.length < 2) return;
    setLoading(true);
    const res = await createGroupChat({ name, participants: selected });
    setLoading(false);
    onGroupCreated && onGroupCreated(res.data.chat);
    onClose();
  };

  return (
    <div className="wa-modal-bg">
      <div className="wa-modal">
        <div className="wa-modal-header">
          <span className="wa-modal-title">Create Group</span>
          <button className="wa-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="wa-modal-body">
          <input
            className="wa-input wa-group-name-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Group Name"
            maxLength={32}
            autoFocus
          />
          <div className="wa-user-list-label">Add Users</div>
          <div className="wa-user-list">
            {users.map(u => (
              <label key={u._id} className={selected.includes(u._id) ? "wa-user-item selected" : "wa-user-item"}>
                <input
                  type="checkbox"
                  value={u._id}
                  checked={selected.includes(u._id)}
                  onChange={e => {
                    if (e.target.checked) setSelected([...selected, u._id]);
                    else setSelected(selected.filter(id => id !== u._id));
                  }}
                />
                <span className="wa-user-avatar">{u.name[0]}</span>
                <span className="wa-user-name">{u.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="wa-modal-footer">
          <button
            className="wa-btn wa-btn-primary"
            onClick={handleCreate}
            disabled={loading || !name || selected.length < 2}
          >
            {loading ? "Creating..." : "Create"}
          </button>
          <button className="wa-btn wa-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
