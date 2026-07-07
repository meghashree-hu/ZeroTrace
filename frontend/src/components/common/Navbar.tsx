import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Bell, Search, ShieldCheck } from "lucide-react";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 border-b border-white/10 bg-slate-950/75 backdrop-blur-2xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-700 shadow-lg shadow-cyan-500/20 lg:hidden">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Security Console</div>
            <div className="text-xs text-slate-400">Protected workspace</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 md:flex">
            <Search className="h-4 w-4 text-cyan-300" />
            <input placeholder="Search" className="w-36 bg-transparent outline-none placeholder:text-slate-500" />
          </label>

          <button className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-300 transition hover:bg-white/10 hover:text-white" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-500" />
            <div className="hidden text-left sm:block">
              <div className="text-sm font-medium text-white">{user?.fullName || user?.email}</div>
              <div className="text-xs text-slate-400">{user?.email}</div>
            </div>
            <button onClick={handleLogout} className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
