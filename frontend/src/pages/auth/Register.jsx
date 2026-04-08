/* eslint-disable no-unused-vars */
import { useState } from "react";
import { registerUser } from "../../api/authApi";
import { useNavigate } from "react-router-dom";
import "../../styles/AuthForm.css";

export default function Register() {
  const navigate = useNavigate();

  const [input, setInput] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const submit = async () => {
    try {
      if (!input.name || !input.email || !input.password) {
        return setError("All fields are required!");
      }

      await registerUser(input);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="auth-form-container">
      <form className="auth-form" onSubmit={e => { e.preventDefault(); submit(); }}>
        <h2>Register</h2>
        {error && <div className="auth-error">{error}</div>}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={input.name}
          onChange={handleChange}
          className="auth-input"
          autoComplete="off"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={input.email}
          onChange={handleChange}
          className="auth-input"
          autoComplete="off"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={input.password}
          onChange={handleChange}
          className="auth-input"
          autoComplete="off"
        />
        <button className="auth-btn" type="submit">
          Register
        </button>
        <p className="auth-link">
          Already have an account?{' '}
          <span onClick={() => navigate("/login")}>Login</span>
        </p>
      </form>
    </div>
  );
}