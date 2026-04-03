import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function MemberRegister() {
  const { registerMember } = useAuth();
  const navigate           = useNavigate();

  const [form, setForm] = useState({
    firstname:  "",
    lastname:   "",
    middlename: "",
    username:   "",
    password:   "",
    confirm:    "",
  });
  const [errors,  setErrors]  = useState({});
  const [showPw,  setShowPw]  = useState(false);
  const [showCf,  setShowCf]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handle = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstname.trim())  e.firstname  = "First name is required.";
    if (!form.lastname.trim())   e.lastname   = "Last name is required.";
    if (!form.username.trim())   e.username   = "Username is required.";
    if (form.username.length < 4) e.username  = "Username must be at least 4 characters.";
    if (!form.password)          e.password   = "Password is required.";
    if (form.password.length < 6) e.password  = "Password must be at least 6 characters.";
    if (form.password !== form.confirm) e.confirm = "Passwords do not match.";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setLoading(true);
    setTimeout(() => {
      // Register the member — non-official by default
      registerMember({
        firstname:  form.firstname,
        lastname:   form.lastname,
        middlename: form.middlename,
        username:   form.username,
        password:   form.password,
      });
      setLoading(false);
      setDone(true);
    }, 600);
  };

  // ── Success Screen ──
  if (done) return (
    <div className="lp-page">
      <div className="lp-left">
        <div className="lp-brand">
          <div className="lp-logo">🌿</div>
          <div className="lp-brand-name">Leaf MPC</div>
          <div className="lp-brand-tagline">Multi-Purpose Cooperative<br />Member Portal</div>
          <div className="lp-brand-location">Lucena City, Quezon Province</div>
        </div>
      </div>
      <div className="lp-right">
        <div className="lp-card" style={{ alignItems: "center", textAlign: "center", gap: 14 }}>
          <div style={{ fontSize: 56 }}>🎉</div>
          <div className="lp-card-title">Account Created!</div>
          <div className="lp-card-sub" style={{ maxWidth: 300 }}>
            Welcome, <strong>{form.firstname}!</strong> Your account has been created.
            You can now log in and access the member portal.
          </div>
          <div className="lp-notice-box">
            <div className="lp-notice-icon">ℹ️</div>
            <div className="lp-notice-text">
              Some features require <strong>Official Member</strong> status. Visit the office to complete your membership and unlock all features.
            </div>
          </div>
          <button className="lp-btn" style={{ width: "100%", marginTop: 8 }} onClick={() => navigate("/login")}>
            Go to Sign In
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="lp-page">

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
          <div className="lp-card-title">Create Account</div>
          <div className="lp-card-sub">Register to access the Leaf MPC member portal</div>

          <div className="lp-form">

            {/* Name fields */}
            <div className="lp-field-row">
              <div className="lp-field">
                <label className="lp-label">First Name <span className="lp-req">*</span></label>
                <input
                  className={`lp-input ${errors.firstname ? "lp-input-err" : ""}`}
                  type="text" name="firstname" value={form.firstname}
                  onChange={handle} placeholder="Juan"
                />
                {errors.firstname && <div className="lp-field-err">{errors.firstname}</div>}
              </div>
              <div className="lp-field">
                <label className="lp-label">Last Name <span className="lp-req">*</span></label>
                <input
                  className={`lp-input ${errors.lastname ? "lp-input-err" : ""}`}
                  type="text" name="lastname" value={form.lastname}
                  onChange={handle} placeholder="Dela Cruz"
                />
                {errors.lastname && <div className="lp-field-err">{errors.lastname}</div>}
              </div>
            </div>

            <div className="lp-field">
              <label className="lp-label">Middle Name <span className="lp-optional">(optional)</span></label>
              <input
                className="lp-input"
                type="text" name="middlename" value={form.middlename}
                onChange={handle} placeholder="Santos"
              />
            </div>

            {/* Username */}
            <div className="lp-field">
              <label className="lp-label">Username <span className="lp-req">*</span></label>
              <input
                className={`lp-input ${errors.username ? "lp-input-err" : ""}`}
                type="text" name="username" value={form.username}
                onChange={handle} placeholder="e.g. juan123"
                autoComplete="username"
              />
              {errors.username && <div className="lp-field-err">{errors.username}</div>}
            </div>

            {/* Password */}
            <div className="lp-field">
              <label className="lp-label">Password <span className="lp-req">*</span></label>
              <div className="lp-pw-wrap">
                <input
                  className={`lp-input ${errors.password ? "lp-input-err" : ""}`}
                  type={showPw ? "text" : "password"}
                  name="password" value={form.password}
                  onChange={handle} placeholder="At least 6 characters"
                  autoComplete="new-password"
                />
                <button className="lp-pw-toggle" onClick={() => setShowPw(p => !p)} tabIndex={-1} type="button">
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <div className="lp-field-err">{errors.password}</div>}
            </div>

            {/* Confirm Password */}
            <div className="lp-field">
              <label className="lp-label">Confirm Password <span className="lp-req">*</span></label>
              <div className="lp-pw-wrap">
                <input
                  className={`lp-input ${errors.confirm ? "lp-input-err" : ""}`}
                  type={showCf ? "text" : "password"}
                  name="confirm" value={form.confirm}
                  onChange={handle} placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                <button className="lp-pw-toggle" onClick={() => setShowCf(p => !p)} tabIndex={-1} type="button">
                  {showCf ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirm && <div className="lp-field-err">{errors.confirm}</div>}
            </div>

            {/* Submit */}
            <button className="lp-btn" onClick={handleSubmit} disabled={loading}>
              {loading ? <span className="lp-spinner" /> : "Create Account"}
            </button>

            {/* Back to login */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#888" }}>Already have an account? </span>
              <button className="lp-link-btn" onClick={() => navigate("/login")}>Sign In</button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}