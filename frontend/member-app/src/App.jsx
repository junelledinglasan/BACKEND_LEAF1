import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import ProtectedRoute      from "./components/ProtectedRoute";

// Layout
import MemberLayout        from "./layouts/MemberLayout";

// Pages
import MemberLogin         from "./pages/MemberLogin";
import MemberRegister      from "./pages/MemberRegister";

// Member components
import MemberDashboard     from "../../admin-app/src/components/member/MemberDashboard";
import MyLoans             from "../../admin-app/src/components/member/MyLoans";
import Notifications       from "../../admin-app/src/components/member/Notifications";
import MemberAnnouncements from "../../admin-app/src/components/member/MemberAnnouncements";
import LoanApplication     from "../../admin-app/src/components/member/LoanApplication";
import MemberProfile       from "../../admin-app/src/components/member/MemberProfile";
import ApplyMembership     from "../../admin-app/src/components/member/ApplyMembership";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* Default → member login */}
          <Route path="/"         element={<Navigate to="/login" replace />} />
          <Route path="/login"    element={<MemberLogin />}    />
          <Route path="/register" element={<MemberRegister />} />

          {/* ── Member Routes ── */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={["member"]} loginPath="/login">
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"        element={<MemberDashboard />} />
            <Route path="my-loans"         element={<MyLoans />} />
            <Route path="notifications"    element={<Notifications />} />
            <Route path="announcements"    element={<MemberAnnouncements />} />
            <Route path="apply"            element={<LoanApplication />} />
            <Route path="profile"          element={<MemberProfile />} />
            <Route path="apply-membership" element={<ApplyMembership />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}