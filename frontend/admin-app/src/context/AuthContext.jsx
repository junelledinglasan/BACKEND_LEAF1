import { createContext, useContext, useState } from "react";

// ─── Admin/Staff only users ───────────────────────────────────────────────────
const INITIAL_USERS = [
  {
    id: 1, username: "junelle123", password: "admin123",
    role: "admin", name: "Junelle Dinglasan", initials: "JD",
    memberId: null, isOfficial: true,
  },
  {
    id: 2, username: "staff01", password: "staff123",
    role: "staff", name: "Staff User", initials: "S",
    memberId: null, isOfficial: true,
  },
];

// ─── Initial Applications ─────────────────────────────────────────────────────
const INITIAL_APPLICATIONS = [
  {
    id: "OA-2026-001", submittedAt: "2026-03-18 09:14", status: "Pending",
    firstname: "Juan", lastname: "Dela Cruz", middlename: "Santos",
    birthdate: "1992-05-14", gender: "Male", civilStatus: "Married",
    address: "123 Rizal St., Lucena City, Quezon", contact: "09171234567",
    email: "juan.delacruz@email.com", occupation: "Teacher",
    validId: "Philippine Passport", idNumber: "P1234567A",
    beneficiary: "Maria Dela Cruz", relationship: "Spouse",
  },
  {
    id: "OA-2026-002", submittedAt: "2026-03-18 10:32", status: "Pending",
    firstname: "Maria", lastname: "Reyes", middlename: "Lopez",
    birthdate: "1988-11-03", gender: "Female", civilStatus: "Single",
    address: "45 Mabini Ave., Pagbilao, Quezon", contact: "09281234567",
    email: "maria.reyes@email.com", occupation: "Nurse",
    validId: "SSS ID", idNumber: "SS-1234-5678",
    beneficiary: "Roberto Reyes", relationship: "Father",
  },
  {
    id: "OA-2026-003", submittedAt: "2026-03-17 14:05", status: "Approved",
    firstname: "Carlos", lastname: "Bautista", middlename: "Cruz",
    birthdate: "1975-08-22", gender: "Male", civilStatus: "Married",
    address: "78 Bonifacio Rd., Tayabas City, Quezon", contact: "09391234567",
    email: "carlos.bautista@email.com", occupation: "Farmer",
    validId: "UMID", idNumber: "UM-9876543",
    beneficiary: "Linda Bautista", relationship: "Spouse",
  },
  {
    id: "OA-2026-004", submittedAt: "2026-03-17 08:50", status: "Rejected",
    firstname: "Ana", lastname: "Gonzales", middlename: "Torres",
    birthdate: "2005-01-10", gender: "Female", civilStatus: "Single",
    address: "12 Luna St., Candelaria, Quezon", contact: "09451234567",
    email: "ana.gonzales@email.com", occupation: "Student",
    validId: "School ID", idNumber: "SID-2023-001",
    beneficiary: "Rosa Gonzales", relationship: "Mother",
  },
  {
    id: "OA-2026-005", submittedAt: "2026-03-16 11:20", status: "Pending",
    firstname: "Pedro", lastname: "Villanueva", middlename: "Ramos",
    birthdate: "1983-06-30", gender: "Male", civilStatus: "Widowed",
    address: "56 Aguinaldo Blvd., Sariaya, Quezon", contact: "09561234567",
    email: "pedro.villanueva@email.com", occupation: "Carpenter",
    validId: "Driver's License", idNumber: "DL-N01-23-456789",
    beneficiary: "Luis Villanueva", relationship: "Son",
  },
  {
    id: "OA-2026-006", submittedAt: "2026-03-15 15:45", status: "Approved",
    firstname: "Ligaya", lastname: "Soriano", middlename: "Mendoza",
    birthdate: "1990-03-18", gender: "Female", civilStatus: "Married",
    address: "89 Quezon Ave., Lucena City, Quezon", contact: "09671234567",
    email: "ligaya.soriano@email.com", occupation: "Market Vendor",
    validId: "Voter's ID", idNumber: "VI-1234567",
    beneficiary: "Ramon Soriano", relationship: "Spouse",
  },
  {
    id: "OA-2026-007", submittedAt: "2026-03-14 09:00", status: "Pending",
    firstname: "Nena", lastname: "Pascual", middlename: "Aquino",
    birthdate: "1979-12-05", gender: "Female", civilStatus: "Married",
    address: "34 Magsaysay St., Lucban, Quezon", contact: "09781234567",
    email: "nena.pascual@email.com", occupation: "Seamstress",
    validId: "PhilHealth ID", idNumber: "PH-0987654",
    beneficiary: "Edgar Pascual", relationship: "Spouse",
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [users,        setUsers]        = useState(INITIAL_USERS);
  const [applications, setApplications] = useState(INITIAL_APPLICATIONS);

  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("leaf_admin_user");
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // ─── Login (admin/staff only) ─────────────────────────────────────────────
  const login = (username, password) => {
    const found = users.find(
      u => u.username === username.trim() && u.password === password
    );
    if (!found) return { success: false, message: "Invalid username or password." };
    if (found.role === "member") return { success: false, message: "This login is for office personnel only." };
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem("leaf_admin_user", JSON.stringify(safeUser));
    return { success: true, role: safeUser.role };
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setUser(null);
    localStorage.removeItem("leaf_admin_user");
  };

  // ─── Add Staff ────────────────────────────────────────────────────────────
  const addStaff = ({ name, username, password }) => {
    const exists = users.find(u => u.username === username.trim());
    if (exists) return { success: false, message: "Username already exists." };
    const initials = name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
    const newStaff = {
      id: users.length + 1, username: username.trim(), password,
      role: "staff", name: name.trim(), initials, memberId: null, isOfficial: true,
    };
    setUsers(prev => [...prev, newStaff]);
    return { success: true, staff: newStaff };
  };

  // ─── Edit Staff ───────────────────────────────────────────────────────────
  const editStaff = (id, { name, username }) => {
    const exists = users.find(u => u.username === username.trim() && u.id !== id);
    if (exists) return { success: false, message: "Username already taken." };
    const initials = name.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, name: name.trim(), username: username.trim(), initials } : u
    ));
    return { success: true };
  };

  // ─── Reset Staff Password ─────────────────────────────────────────────────
  const resetStaffPassword = (id, newPassword) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, password: newPassword } : u));
    return { success: true };
  };

  // ─── Get Staff List ───────────────────────────────────────────────────────
  const getStaffList = () => users.filter(u => u.role === "staff");

  // ─── Applications ─────────────────────────────────────────────────────────
  const getApplications    = () => applications;
  const updateApplicationStatus = (id, status) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  };

  return (
    <AuthContext.Provider value={{
      user, login, logout,
      addStaff, editStaff, resetStaffPassword, getStaffList,
      getApplications, updateApplicationStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}