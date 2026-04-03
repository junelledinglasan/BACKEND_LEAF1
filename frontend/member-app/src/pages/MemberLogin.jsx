import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function MemberLogin() {
  const { login }  = useAuth();
  const navigate   = useNavigate();

  const [form,    setForm]    = useState({ username: "", password: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);
  const [showMsg, setShowMsg] = useState(false);

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

      if (result.role !== "member") {
        setError("This login is for members only. Please use the office portal.");
        return;
      }

      navigate("/member/dashboard", { replace: true });
    }, 600);
  };

  const handleKeyDown = e => { if (e.key === "Enter") handleSubmit(); };

  return (
    <div className="lp-page">

      {/* ── Forgot Password Modal ── */}
      {showMsg && (
        <div className="lp-msg-overlay" onClick={() => setShowMsg(false)}>
          <div className="lp-msg-box" onClick={e => e.stopPropagation()}>
            <div className="lp-msg-icon">🔑</div>
            <div className="lp-msg-title">Forgot Password?</div>
            <div className="lp-msg-text">
              For password reset, please visit the office or contact the LEAF MPC administrator.
            </div>
            <button className="lp-msg-btn" onClick={() => setShowMsg(false)}>Got it</button>
          </div>
        </div>
      )}

      {/* ── Left Panel ── */}
      <div className="lp-left">
        <div className="lp-brand">
          <div className="lp-logo">🌿</div>
          <div className="lp-brand-name">Leaf MPC</div>
          <div className="lp-brand-tagline">
            Multi-Purpose Cooperative<br />Member Portal
          </div>
          <div className="lp-brand-location">Lucena City, Quezon Province</div>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="lp-right">
        <div className="lp-card">
          <div className="lp-card-logo">🌿</div>
          <div className="lp-card-title">Member Login</div>
          <div className="lp-card-sub">Access your Leaf MPC member account</div>

          <div className="lp-form">
            {/* Username */}
            <div className="lp-field">
              <label className="lp-label">Username</label>
              <input
                className={`lp-input ${error ? "lp-input-err" : ""}`}
                type="text"
                name="username"
                placeholder="Enter your username"
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
              <button className="lp-link-btn" onClick={() => setShowMsg(true)}>
                Forgot Password?
              </button>
              <button className="lp-link-btn" onClick={() => navigate("/register")}>
                Create Account
              </button>
            </div>

            {/* Error */}
            {error && <div className="lp-error">⚠ {error}</div>}

            {/* ← "Login" lang */}
            <button className="lp-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="lp-spinner" /> : "Login"}
            </button>
          </div>

          {/* Demo credentials */}
          <div className="lp-demo">
            <div className="lp-demo-title">Demo Account</div>
            <div className="lp-demo-row">
              <span className="lp-demo-role member">Member</span>
              <span className="lp-demo-cred">maria0123 / member123</span>
            </div>
          </div>

          <div className="lp-role-notice">
            💡 Don't have an account? Click <strong>Create Account</strong> to register.
          </div>
        </div>
      </div>
    </div>
  );
}