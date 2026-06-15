import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success'|'error', text: string }

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // Safely parse JSON
      let data = {};
      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (response.ok) {
        // Store token — handle both { token } and { data: { token } }
        const token =
          data?.token ||
          data?.data?.token ||
          data?.accessToken ||
          data?.access_token ||
          null;

        if (token) {
          localStorage.setItem("token", token);
        }

        setMessage({ type: "success", text: "Login successful! Redirecting..." });

        // Redirect after short delay
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1000);
      } else {
        const errText =
          data?.message ||
          data?.error ||
          data?.msg ||
          "Login failed. Please check your credentials.";
        setMessage({ type: "error", text: errText });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoBox}>⠿</div>

        <h2 style={styles.title}>SMS Marketing</h2>
        <p style={styles.subtitle}>Sign in to your account</p>

        {/* Message Banner */}
        {message && (
          <div
            style={{
              ...styles.banner,
              background: message.type === "success" ? "#d1fae5" : "#fee2e2",
              color: message.type === "success" ? "#065f46" : "#991b1b",
              border: `1px solid ${message.type === "success" ? "#6ee7b7" : "#fca5a5"}`,
            }}
          >
            {message.type === "success" ? "✅" : "❌"} {message.text}
          </div>
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
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <div style={styles.hint}>
          <strong>Default credentials:</strong>
          <br />
          Email: admin@smsmarketing.com
          <br />
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 16,
    padding: "40px 36px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  logoBox: {
    fontSize: 36,
    textAlign: "center",
    marginBottom: 8,
  },
  title: {
    textAlign: "center",
    fontSize: 24,
    fontWeight: 700,
    color: "#1e3a8a",
    margin: "0 0 4px",
  },
  subtitle: {
    textAlign: "center",
    color: "#6b7280",
    marginBottom: 24,
    fontSize: 14,
  },
  banner: {
    padding: "10px 14px",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: 500,
  },
  label: {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    fontSize: 14,
    marginBottom: 16,
    boxSizing: "border-box",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "13px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 4,
  },
  hint: {
    marginTop: 20,
    padding: "12px 14px",
    background: "#f9fafb",
    borderRadius: 8,
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.7,
  },
};