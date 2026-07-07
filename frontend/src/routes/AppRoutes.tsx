import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Dashboard";
import UploadDocument from "../pages/document/UploadDocument";
import MyDocuments from "../pages/document/MyDocuments";
import GenerateShare from "../pages/share/GenerateShare";
import ShareDocument from "../pages/share/ShareDocument";
import PendingRequests from "../pages/session/PendingRequests";
import AuditLogs from "../pages/audit/AuditLogs";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../contexts/AuthContext";


function RequireAuth() {
  const location = useLocation();
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/share/:shareToken" element={<ShareDocument />} />
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/documents/upload" element={<UploadDocument />} />
            <Route path="/documents" element={<MyDocuments />} />
            <Route path="/share" element={<GenerateShare />} />
            <Route path="/session/pending" element={<PendingRequests />} />
            <Route path="/audit/logs" element={<AuditLogs />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
