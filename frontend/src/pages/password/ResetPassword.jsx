import { useState } from "react";
import { useParams } from "react-router-dom";
import { resetPassword } from "../../api/passwordApi.js";
import "../../styles/resetPass.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");

  const submit = async () => {
    try {
      await resetPassword(token, { password });
      alert("Password Updated Successfully");
    } catch (err) {
      if (err.response && err.response.status === 401) {
        alert("Unauthorized or invalid token. Please try the reset link again.");
      } else {
        alert("Failed to reset password. Please try again.");
      }
    }
  };

  return (
    <div className="resetpass-container">
      <form className="resetpass-form" onSubmit={e => { e.preventDefault(); submit(); }}>
        <h2 className="resetpass-title">Reset Password</h2>
        <input
          className="resetpass-input"
          type="password"
          placeholder="New Password"
          onChange={e => setPassword(e.target.value)}
          autoComplete="off"
        />
        <button className="resetpass-btn" type="submit">Update</button>
      </form>
    </div>
  );
}
