import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Shield, Upload, FolderOpen, Share2, Clock3, ScrollText, Settings, LogOut } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const menu = [
  { name: "Dashboard", path: "/dashboard", icon: Shield },
  { name: "Upload Document", path: "/documents/upload", icon: Upload },
  { name: "My Documents", path: "/documents", icon: FolderOpen },
  { name: "Generate Share", path: "/share", icon: Share2 },
  { name: "Pending Requests", path: "/session/pending", icon: Clock3 },
  { name: "Audit Logs", path: "/audit/logs", icon: ScrollText },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-white/10 bg-slate-950/90 px-4 py-5 backdrop-blur-xl">
      <div className="mb-7 rounded-2xl border border-cyan-400/15 bg-white/5 p-4 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-lg shadow-cyan-500/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">ZeroTrace</div>
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Secure Docs</div>
          </div>
        </div>
      </div>

      <div className="mb-3 px-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Workspace</div>

      <nav className="space-y-2">
        {menu.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-white shadow-[0_0_35px_rgba(34,211,238,0.12)]"
                  : "text-slate-400 hover:-translate-y-0.5 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${isActive ? "bg-cyan-500/15 text-cyan-300" : "bg-white/5 text-slate-400 group-hover:text-cyan-300"}`}>
                <Icon className="h-4 w-4" />
              </span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-400">
        <div className="mb-2 flex items-center gap-2 text-slate-200">
          <Settings className="h-4 w-4 text-cyan-300" />
          Threat posture
        </div>
        <div className="text-xs leading-6 text-slate-500">
          Layered protection and continuous verification keep every document secured.
        </div>
      </div>

      <button onClick={handleLogout} className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20">
        <LogOut className="h-4 w-4" />
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
