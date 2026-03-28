/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { profileUser } from "../../api/authApi.js";
import { removeToken } from "../../utils/storage.js";
import { useNavigate } from "react-router-dom";
import "../../styles/Profile.css";

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadProfile = async () => {
    try {
      const { data } = await profileUser();
      setUser(data.user);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      removeToken();
      setUser(null);
      navigate("/login");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const logout = () => {
    removeToken();
    setUser(null);
    navigate("/login");
  };

  if (loading)
    return (
      <div className="profile-loading">
        Loading profile...
      </div>
    );
  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile</h2>
      <p className="profile-field">
        <strong>Name:</strong> {user?.name}
      </p>
      <p className="profile-field">
        <strong>Email:</strong> {user?.email}
      </p>
      <button className="profile-logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
