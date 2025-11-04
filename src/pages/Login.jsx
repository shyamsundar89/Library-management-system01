import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function submit(e) {
    e.preventDefault();
    const res = login({ username, password });
    if (!res.ok) return toast.error(res.msg);
    toast
      .promise(new Promise((r) => setTimeout(r, 1200)), {
        pending: "Signing in...",
        success: "Login successful",
        error: "Failed",
      })
      .then(() => nav("/dashboard"));
  }

  return (
    <div className="logincard">
      <h2>Login</h2>
      <form onSubmit={submit} className="form">
        <label>User</label>
        <input
          className="input"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="username"
        />

        <label>Password</label>
        <input
          className="input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <button type="submit" className="btn">
          Login
        </button>
      </form>
      <p className="muted">
        Tip: username “admin” gives Admin role; anything else gives User.
      </p>
    </div>
  );
}
