import { Outlet } from "react-router-dom";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_32%),linear-gradient(135deg,#020617_0%,#0b1120_48%,#111827_100%)] text-slate-100">
      <div className="flex min-h-screen">
        <aside className="fixed left-0 top-0 z-30 hidden h-screen w-72 lg:block">
          <Sidebar />
        </aside>

        <div className="flex min-h-screen flex-1 flex-col lg:ml-72">
          <header className="fixed left-0 right-0 top-0 z-20 h-16 lg:left-72">
            <Navbar />
          </header>

          <main className="mt-16 flex-1 overflow-y-auto px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
