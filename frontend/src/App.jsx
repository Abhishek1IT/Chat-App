import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import AppRoutes from "./routes";
import './App.css';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  if (!user) return null;
  return (
    <nav className="navbar">
      <div className="navbar-links">
        <span className="navbar-link" onClick={() => navigate("/users")}>Users</span>
        <span className="navbar-link" onClick={() => navigate("/profile")}>Profile</span>
        <span className="navbar-link" onClick={onLogout}>Logout</span>
        <span className="navbar-link" onClick={() => navigate("/groups")}>Groups</span>
      </div>
    </nav>
  );
}

function App() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <AppRoutes user={user} />
    </>
  );
}

export default App;