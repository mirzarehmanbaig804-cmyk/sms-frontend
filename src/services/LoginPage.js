import React, { useState } from "react";
import { authAPI } from "./api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authAPI.login({ email, password });
      const token = res.data.token;
      const user = res.data.user;

      localStorage.setItem("sms_token", token);
      localStorage.setItem("sms_user", JSON.stringify(user));

      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoBox}>⠿</div>
        <h2 style={styles.title}>SMS Marketing</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {error && (
          <div style={styles.errorBox}>❌ {error}</div>
        )}

        <form onSubmit={handleLogin}>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@smsmarketing.com"
            required
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={styles.hint}>
          <strong>Default credentials:</strong><br />
          Email: admin@smsmarketing.com<br />
          Password: Admin@123
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#fff", borderRadius: 16, padding: "40px 36px",
    width: "100%", maxWidth: 420, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  logoBox: { fontSize: 36, textAlign: "center", marginBottom: 8 },
  title: { textAlign: "center", fontSize: 24, fontWeight: 700, color: "#1e3a8a", margin: "0 0 4px" },
  subtitle: { textAlign: "center", color: "#6b7280", marginBottom: 24, fontSize: 14 },
  errorBox: {
    background: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5",
    padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 14,
  },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: {
    width: "100%", padding: "12px 14px", border: "1px solid #d1d5db",
    borderRadius: 8, fontSize: 14, marginBottom: 16, boxSizing: "border-box",
  },
  button: {
    width: "100%", padding: "13px", background: "#2563eb", color: "#fff",
    border: "none", borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: "pointer",
  },
  hint: {
    marginTop: 20, padding: "12px 14px", background: "#f9fafb",
    borderRadius: 8, fontSize: 13, color: "#6b7280", lineHeight: 1.7,
  },
};