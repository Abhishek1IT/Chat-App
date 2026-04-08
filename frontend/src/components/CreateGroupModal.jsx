import { useState, useEffect } from "react";
import { getAllUsers } from "../api/userApi";
import { createGroupChat } from "../api/chatApi";

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
    <div className="group-settings-modal">
      <h4>Create Group</h4>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="Group Name" />
      <select multiple value={selected} onChange={e => setSelected(Array.from(e.target.selectedOptions, o => o.value))}>
        {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
      </select>
      <button onClick={handleCreate} disabled={loading || !name || selected.length < 2}>Create</button>
      <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
    </div>
  );
}
