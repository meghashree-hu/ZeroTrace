import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white shadow flex items-center justify-between px-8">

      <h2 className="text-xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">

        <span className="font-medium">
          {user?.fullName}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Logout
        </button>

      </div>

    </header>
  );
}

export default Navbar;