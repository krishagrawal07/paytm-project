import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("adminEmail");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6">
      <div>
        <h1 className="text-lg font-bold text-slate-800">Paytm DBMS Admin Panel</h1>
        <p className="text-sm text-slate-500">{adminEmail || "Admin"}</p>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;
