import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/authApi";
import { setToken } from "../../utils/storage";
import { AuthContext } from "../../context/AuthContext";
import "../../styles/AuthForm.css";
import "../../styles/ForgotPass.css";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [input, setInput] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const submit = async () => {
    try {
      const { data } = await loginUser(input);
      setToken(data.token);
      setUser(data.user);
      navigate("/profile");
    } catch (err) {
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={e => { e.preventDefault(); submit(); }}>
        <h2>Login</h2>
        <input
          className="auth-input"
          placeholder="Email"
          type="email"
          onChange={e => setInput({ ...input, email: e.target.value })}
          autoComplete="off"
        />
        <input
          className="auth-input"
          placeholder="Password"
          type="password"
          onChange={e => setInput({ ...input, password: e.target.value })}
          autoComplete="off"
        />
        <div className="forgot-link-container">
          <span
            className="forgot-link"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </span>
        </div>
        <button className="auth-btn" type="submit">Login</button>
      </form>
    </div>
  );
}