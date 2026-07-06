import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "../pages/auth/Login";
import Dashboard from "../pages/dashboard/Dashboard";
import UploadDocument from "../pages/document/UploadDocument";
import MyDocuments from "../pages/document/MyDocuments";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
    path="/documents/upload"
    element={<UploadDocument />}
/>
<Route path="/documents" element={<MyDocuments />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;