import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  myChats,
  addAdmin,
  removeAdmin,
  adminRemoveUser,
  leaveGroup,
  deleteGroup,
} from "../../api/chatApi";
import { getAllUsers } from "../../api/userApi";
import CreateGroupModal from "../../components/CreateGroupModal";
import AddUserModal from "../../components/AddUserModal";
import "../../styles/GroupManager.css";

export default function GroupManager() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    myChats().then(({ data }) =>
      setGroups((data || []).filter((g) => g.isGroupChat)),
    );
  }, [refresh]);

  // Always include current user in allUsers
  const fetchAllUsers = async () => {
    const { data } = await getAllUsers();
    let users = data.users || [];
    // If current user not in list, add from context
    if (user && !users.find((u) => u._id === user._id)) {
      users = [{ _id: user._id, name: user.name, email: user.email, avatar: user.avatar }, ...users];
    }
    setAllUsers(users);
  };

  useEffect(() => {
    fetchAllUsers();
    // eslint-disable-next-line
  }, [refresh, user]);

  // Deselect group if it is deleted or left
  useEffect(() => {
    if (selectedGroup && !groups.find((g) => g._id === selectedGroup._id)) {
      setSelectedGroup(null);
    }
  }, [groups, selectedGroup]);

  // Select group to show options
  const handleSelectGroup = (g) => {
    setSelectedGroup(g);
  };

  // Helper to fetch latest group info from backend
  const fetchGroupById = async (groupId) => {
    // myChats returns all, so find the group by id
    const { data } = await myChats();
    const group = (data || []).find((g) => g._id === groupId);
    if (group) setSelectedGroup(group);
  };
  // Create group handler
  const handleGroupCreated = (groupData) => {
    setShowCreate(false);
    setMessage("Group created!");
    setRefresh((r) => !r);
  };
  // Add user handler
  const handleUserAdded = async (userData) => {
    setShowAddUser(false);
    setMessage("User added!");
    setRefresh((r) => !r);
    fetchAllUsers();
    if (selectedGroup) await fetchGroupById(selectedGroup._id);
  };
  // Admin actions
  const handleMakeAdmin = async (uid) => {
    try {
      await addAdmin({ groupId: selectedGroup._id, userId: uid });
      setMessage("Admin added!");
      setRefresh((r) => !r);
      fetchAllUsers();
      if (selectedGroup) await fetchGroupById(selectedGroup._id);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error making admin");
    }
  };
  // Admin actions
  const handleRemoveAdmin = async (uid) => {
    try {
      await removeAdmin({
        groupId: selectedGroup._id,
        userId: uid,
      });
      setMessage("Admin removed!");
      setRefresh((r) => !r);
      fetchAllUsers();
      if (selectedGroup) await fetchGroupById(selectedGroup._id);
    } catch (err) {
      setMessage(err?.response?.data?.message || "Error removing admin");
    }
  };
  const handleRemoveUser = async (uid) => {
    await adminRemoveUser({ groupId: selectedGroup._id, userId: uid });
    setMessage("User removed!");
    setRefresh((r) => !r);
    fetchAllUsers();
    if (selectedGroup) await fetchGroupById(selectedGroup._id);
  };
  const handleLeaveGroup = async () => {
    try {
      await leaveGroup({ groupId: selectedGroup._id });
      setMessage("Left group!");
      setSelectedGroup(null);
      setRefresh((r) => !r);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error leaving group";
      setMessage(errorMsg);
      console.error("Leave group error:", errorMsg, err);
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup(selectedGroup._id);
      setMessage("Group deleted!");
      setSelectedGroup(null);
      setRefresh((r) => !r);
    } catch (err) {
      const errorMsg = err?.response?.data?.message || "Error deleting group";
      setMessage(errorMsg);
      console.error("Delete group error:", errorMsg, err);
    }
  };

  return (
    <div className="group-manager-container">
      <div className="group-manager-header">
        <h2>Group Manager</h2>
        <button className="gm-create-btn" onClick={() => setShowCreate(true)}>
          <span>＋</span> Create Group
        </button>
      </div>
      {message && <div className="gm-message">{message}</div>}
      <div className="gm-groups-list-section">
        <h4>Your Groups</h4>
        <div className="gm-groups-list">
          {groups.map((g) => (
            <div
              key={g._id}
              className={`gm-group-item${selectedGroup && selectedGroup._id === g._id ? " selected" : ""}`}
              onClick={() => handleSelectGroup(g)}
            >
              <div className="gm-group-avatar">{g.name?.[0]?.toUpperCase() || "👥"}</div>
              <div className="gm-group-name">{g.name}</div>
            </div>
          ))}
        </div>
      </div>
      {selectedGroup && (
        <div className="gm-group-details-section">
          <div className="gm-group-details-header">
            <div className="gm-group-details-avatar">{selectedGroup.name?.[0]?.toUpperCase() || "👥"}</div>
            <div>
              <div className="gm-group-details-name">{selectedGroup.name}</div>
              <div className="gm-group-details-meta">
                <span>Admins: {selectedGroup.admin?.length}</span>
                <span>Members: {selectedGroup.participants?.length}</span>
              </div>
            </div>
          </div>
          <div className="gm-members-list-section">
            <h5>Members</h5>
            <ul className="gm-members-list">
              {selectedGroup.participants.map((uid) => {
                const participantId = typeof uid === "object" && uid._id ? uid._id : uid;
                const userObj = allUsers.find((x) => x._id === participantId);
                const isAdmin = selectedGroup.admin.map(String).includes(String(user?._id));
                const isTargetAdmin = selectedGroup.admin.map(String).includes(String(participantId));
                return (
                  <li key={participantId} className="gm-member-item">
                    <div className={`gm-member-avatar${isTargetAdmin ? " admin" : ""}`}>{userObj?.name?.[0]?.toUpperCase() || "👤"}</div>
                    <div className="gm-member-info">
                      <span className="gm-member-name">{userObj?.name || "Unknown"}</span>
                      {isTargetAdmin && <span className="gm-member-role">Admin</span>}
                    </div>
                    {isAdmin && user?._id !== participantId && (
                      <div className="gm-member-actions">
                        {isTargetAdmin ? (
                          <button className="gm-btn gm-remove-admin" onClick={() => handleRemoveAdmin(participantId)}>
                            Remove Admin
                          </button>
                        ) : (
                          <button className="gm-btn gm-make-admin" onClick={() => handleMakeAdmin(participantId)}>
                            Make Admin
                          </button>
                        )}
                        <button className="gm-btn gm-remove-user" onClick={() => handleRemoveUser(participantId)}>
                          Remove
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
            <button className="gm-btn gm-add-user" onClick={() => setShowAddUser(true)}>
              Add User
            </button>
          </div>
          <div className="gm-group-actions">
            <button className="gm-btn gm-leave-group" onClick={handleLeaveGroup}>
              Leave Group
            </button>
            <button className="gm-btn gm-open-chat" onClick={() => navigate(`/chat/${selectedGroup._id}`)}>
              Open Chat
            </button>
            <button className="gm-btn gm-delete-group" onClick={handleDeleteGroup}>
              Delete Group
            </button>
          </div>
        </div>
      )}
      {showCreate && (
        <CreateGroupModal onClose={() => setShowCreate(false)} onGroupCreated={handleGroupCreated} />
      )}
      {showAddUser && selectedGroup && (
        <AddUserModal
          group={selectedGroup}
          onClose={() => setShowAddUser(false)}
          onUserAdded={(userId) => handleUserAdded({ groupId: selectedGroup._id, userId })}
        />
      )}
    </div>
  );
}