import { createContext, useContext, useState } from "react";

// ─── Member only users ────────────────────────────────────────────────────────
const INITIAL_USERS = [
  {
    id: 1, username: "maria0123", password: "member123",
    role: "member", name: "Maria Santos", initials: "MS",
    memberId: "LEAF-100-05", status: "Active", isOfficial: true,
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(INITIAL_USERS);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("leaf_member_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // ─── Login (member only) ──────────────────────────────────────────────────
  const login = (username, password) => {
    const found = users.find(
      u => u.username === username.trim() && u.password === password
    );
    if (!found) return { success: false, message: "Invalid username or password." };
    if (found.role !== "member") return { success: false, message: "This login is for members only." };
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem("leaf_member_user", JSON.stringify(safeUser));
    return { success: true, role: safeUser.role };
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("leaf_member_user");
  };

  // ─── Register Member ──────────────────────────────────────────────────────
  const registerMember = ({ firstname, lastname, middlename, username, password }) => {
    const exists = users.find(u => u.username === username.trim());
    if (exists) return { success: false, message: "Username already exists." };
    const newUser = {
      id: users.length + 1,
      username: username.trim(),
      password,
      role: "member",
      name: `${firstname} ${lastname}`,
      initials: `${firstname[0]}${lastname[0]}`.toUpperCase(),
      memberId: null,
      status: "Pending",
      isOfficial: false,
    };
    setUsers(prev => [...prev, newUser]);
    return { success: true };
  };

  // ─── Submit Membership Application ───────────────────────────────────────
  const submitMembershipApplication = (formData) => {
    const now     = new Date();
    const pad     = n => String(n).padStart(2, "0");
    const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    // Store in localStorage so admin-app can read it later (when connected to backend)
    const existing = JSON.parse(localStorage.getItem("leaf_pending_applications") || "[]");
    const newApp = {
      id:          `OA-${now.getFullYear()}-${String(existing.length + 8).padStart(3,"0")}`,
      submittedAt: dateStr,
      status:      "Pending",
      ...formData,
    };
    localStorage.setItem("leaf_pending_applications", JSON.stringify([...existing, newApp]));
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      registerMember, submitMembershipApplication,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}