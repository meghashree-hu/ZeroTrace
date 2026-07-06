import type { ReactNode } from "react";

import Sidebar from "../components/common/Sidebar";
import Navbar from "../components/common/Navbar";

interface Props {
  children: ReactNode;
}

function MainLayout({ children }: Props) {
  return (
    <div className="flex">

      <Sidebar />

      <div className="flex-1 bg-slate-100 min-h-screen">

        <Navbar />

        <main className="p-8">
          {children}
        </main>

      </div>

    </div>
  );
}

export default MainLayout;