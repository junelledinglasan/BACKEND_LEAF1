import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function AdminLogin() {
  const { login }   = useAuth();
  const navigate    = useNavigate();

  const [role,    setRole]    = useState("admin");
  const [form,    setForm]    = useState({ username: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showMsg, setShowMsg] = useState("");

  const handle = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = () => {
    if (!form.username.trim()) { setError("Please enter your username."); return; }
    if (!form.password)        { setError("Please enter your password."); return; }

    setLoading(true);
    setTimeout(() => {
      const result = login(form.username, form.password);
      setLoading(false);

      if (!result.success) { setError(result.message); return; }

      if (result.role !== role) {
        setError(`This account is not a ${role} account. Please select the correct role.`);
        return;
      }

      if (result.role === "admin") navigate("/admin/dashboard", { replace: true });
      if (result.role === "staff") navigate("/staff/home",      { replace: true });
    }, 600);
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="lp-page">

      {/* ── Info Message Modal ── */}
      {showMsg && (
        <div className="lp-msg-overlay" onClick={() => setShowMsg("")}>
          <div className="lp-msg-box" onClick={e => e.stopPropagation()}>
            <div className="lp-msg-icon">🔒</div>
            <div className="lp-msg-title">
              {showMsg === "forgot" ? "Forgot Password?" : "Create Account"}
            </div>
            <div className="lp-msg-text">
              {showMsg === "forgot"
                ? "For password reset, please contact your system administrator."
                : "Admin and Staff accounts are created by the system administrator only. Please contact your admin."
              }
            </div>
            <button className="lp-msg-btn" onClick={() => setShowMsg("")}>Got it</button>
          </div>
        </div>
      )}

      {/* ── Left Panel ── */}
      <div className="lp-left">
        <div className="lp-brand">
          <div className="lp-logo">🌿</div>
          <div className="lp-brand-name">Leaf MPC</div>
          <div className="lp-brand-tagline">
            Office Management System<br />Admin &amp; Staff Portal
          </div>
          <div className="lp-brand-location">Lucena City, Quezon Province</div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="lp-right">
        <div className="lp-card">
          <div className="lp-card-logo">🌿</div>
          <div className="lp-card-title">Office Login</div>
          <div className="lp-card-sub">Select your role to continue</div>

          {/* Role Selector */}
          <div className="lp-role-tabs">
            <button
              className={`lp-role-tab ${role === "admin" ? "active" : ""}`}
              onClick={() => { setRole("admin"); setError(""); }}
            >
              👨‍💼 Admin
            </button>
            <button
              className={`lp-role-tab ${role === "staff" ? "active" : ""}`}
              onClick={() => { setRole("staff"); setError(""); }}
            >
              👤 Staff
            </button>
          </div>

          <div className="lp-form">
            {/* Username */}
            <div className="lp-field">
              <label className="lp-label">Username</label>
              <input
                className={`lp-input ${error ? "lp-input-err" : ""}`}
                type="text"
                name="username"
                placeholder={`Enter your ${role} username`}
                value={form.username}
                onChange={handle}
                onKeyDown={handleKeyDown}
                autoComplete="username"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label">Password</label>
              <div className="lp-pw-wrap">
                <input
                  className={`lp-input ${error ? "lp-input-err" : ""}`}
                  type={showPw ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handle}
                  onKeyDown={handleKeyDown}
                  autoComplete="current-password"
                />
                <button
                  className="lp-pw-toggle"
                  onClick={() => setShowPw(p => !p)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot Password & Create Account */}
            <div className="lp-links-row">
              <button className="lp-link-btn" onClick={() => setShowMsg("forgot")}>
                Forgot Password?
              </button>
              <button className="lp-link-btn" onClick={() => setShowMsg("create")}>
                Create Account
              </button>
            </div>

            {/* Error */}
            {error && <div className="lp-error">⚠ {error}</div>}

            {/* ← "Login" lang ang text, hindi "Sign in as Admin" */}
            <button className="lp-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="lp-spinner" /> : "Login"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="lp-demo">
            <div className="lp-demo-title">Demo Accounts</div>
            <div className="lp-demo-row">
              <span className="lp-demo-role admin">Admin</span>
              <span className="lp-demo-cred">junelle123 / admin123</span>
            </div>
            <div className="lp-demo-row">
              <span className="lp-demo-role staff">Staff</span>
              <span className="lp-demo-cred">staff01 / staff123</span>
            </div>
          </div>

          <div className="lp-role-notice">
            🔒 This portal is for authorized office personnel only.
          </div>
        </div>
      </div>
    </div>
  );
}