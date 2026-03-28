import { useState } from "react";
import { forgotPassword } from "../../api/passwordApi.js";
import "../../styles/ForgotPass.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const submit = async () => {
    await forgotPassword({ email });
    alert("Reset link sent to your email");
  };

  return (
    <div className="forgotpass-container">
      <form className="forgotpass-form" onSubmit={e => { e.preventDefault(); submit(); }}>
        <h2 className="forgotpass-title">Forgot Password</h2>
        <input
          className="forgotpass-input"
          placeholder="Email"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="off"
        />
        <button className="forgotpass-btn" type="submit">Send Reset Link</button>
      </form>
    </div>
  );
}
