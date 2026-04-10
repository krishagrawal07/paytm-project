import { useNavigate } from "react-router-dom";
import { Bell, LogOut, Menu } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const adminEmail = localStorage.getItem("adminEmail");
  const adminName = adminEmail ? adminEmail.split("@")[0] : "Admin";
  const avatarText = adminName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-white/50 bg-white/75 px-4 py-3 shadow-lg shadow-slate-200/60 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("dashboard:toggle-sidebar"))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 md:hidden"
          >
            <Menu size={18} />
          </button>

          <div>
            <h1 className="text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
              Paytm DBMS Admin Panel
            </h1>
            <p className="text-xs text-slate-500 sm:text-sm">Welcome back, {adminName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 sm:inline-flex"
          >
            <Bell size={17} />
          </button>

          <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 py-1.5 sm:flex">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-xs font-semibold text-white">
              {avatarText}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-900">{adminName}</p>
              <p className="truncate text-[11px] text-slate-500">{adminEmail || "admin@paytm.com"}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-gradient-to-r from-red-500 to-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-md shadow-red-300/40 transition-all duration-300 hover:shadow-lg hover:shadow-red-300/60"
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
