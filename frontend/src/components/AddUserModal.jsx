import { useEffect, useState } from "react";
import { getAllUsers } from "../api/userApi";
import { adminAddUser } from "../api/chatapi";

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
    <div className="group-settings-modal">
      <h4>Add User to Group</h4>
      <select value={selected} onChange={e => setSelected(e.target.value)}>
        <option value="">Select user</option>
        {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
      </select>
      <button onClick={handleAdd} disabled={loading || !selected}>Add</button>
      <button onClick={onClose} style={{ marginLeft: 8 }}>Cancel</button>
    </div>
  );
}
