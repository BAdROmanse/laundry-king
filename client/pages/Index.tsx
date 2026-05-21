import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleLogin() {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setMessage("Login failed: " + error.message);
  } else {
    window.location.href = "/home"; // ← add this line
  }
}

  async function handleSignUp() {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage("Signup failed: " + error.message);
    } else {
      setMessage("Account created! Check your email ✅");
    }
  }

  return (
    <div style={{ padding: "40px", maxWidth: "400px", margin: "0 auto" }}>
      <h1>Laundry King </h1>
      <div style={{ marginTop: "20px" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "10px" }}
        />
        <button onClick={handleLogin} style={{ marginRight: "10px", padding: "10px 20px" }}>
          Log In
        </button>
        <button onClick={handleSignUp} style={{ padding: "10px 20px" }}>
          Sign Up
        </button>
        {message && <p style={{ marginTop: "20px", color: "green" }}>{message}</p>}
      </div>
    </div>
  );
}