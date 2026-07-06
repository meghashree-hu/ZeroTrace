import { Link, useLocation } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Upload Document", path: "/documents/upload" },
  { name: "My Documents", path: "/documents" },
  { name: "Generate Share", path: "/share" },
  { name: "Pending Requests", path: "/session/pending" },
];

function Sidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">

      <h1 className="text-2xl font-bold mb-10">
        ZeroTrace
      </h1>

      <nav className="space-y-3">
        {menu.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block rounded-lg px-4 py-3 transition ${
              location.pathname === item.path
                ? "bg-blue-600"
                : "hover:bg-slate-800"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;