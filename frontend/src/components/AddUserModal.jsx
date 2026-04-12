import { useEffect, useState } from "react";
import { getAllUsers } from "../api/userApi";
import { adminAddUser } from "../api/chatApi.js";

export default function AddUserModal({ group, onClose, onUserAdded }) {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllUsers().then(({ data }) => {
      setUsers((data.users || []).filter(u => !group.participants.includes(u._id)));
    });
  }, [group]);

  const handleAdd = async () => {
    if (!selected) return;
    setLoading(true);
    await adminAddUser({ groupId: group._id, userId: selected });
    setLoading(false);
    onUserAdded && onUserAdded();
    onClose();
  };

  return (
    <div className="wa-modal-bg">
      <div className="wa-modal">
        <div className="wa-modal-header">
          <span className="wa-modal-title">Add User to Group</span>
          <button className="wa-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="wa-modal-body">
          <div className="wa-user-list-label">Select User</div>
          <div className="wa-user-list">
            {users.map(u => (
              <label key={u._id} className={selected === u._id ? "wa-user-item selected" : "wa-user-item"}>
                <input
                  type="radio"
                  name="add-user"
                  value={u._id}
                  checked={selected === u._id}
                  onChange={() => setSelected(u._id)}
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
            onClick={handleAdd}
            disabled={loading || !selected}
          >
            {loading ? "Adding..." : "Add"}
          </button>
          <button className="wa-btn wa-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
