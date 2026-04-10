import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  BarChart3,
  CreditCard,
  Gauge,
  Receipt,
  Store,
  Users,
  Wallet,
  X,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Gauge },
  { label: "Users", path: "/users", icon: Users },
  { label: "Merchants", path: "/merchants", icon: Store },
  { label: "Accounts", path: "/accounts", icon: Wallet },
  { label: "Transactions", path: "/transactions", icon: Receipt },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Reports", path: "/reports", icon: BarChart3 },
];

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleToggle = () => {
      setMobileOpen((previous) => !previous);
    };

    window.addEventListener("dashboard:toggle-sidebar", handleToggle);
    return () => {
      window.removeEventListener("dashboard:toggle-sidebar", handleToggle);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-[2px] md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 border-r border-white/10 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100 shadow-2xl transition-transform duration-300 md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-white">Paytm Admin</h2>
            <p className="mt-1 text-xs text-slate-300">DBMS Control Center</p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 text-slate-200 transition hover:bg-white/10 md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="space-y-1.5 p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-blue-500/20 text-white shadow-lg shadow-blue-900/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ${
                        isActive
                          ? "border-blue-300/30 bg-blue-500/30 text-blue-100"
                          : "border-white/10 bg-white/5 text-slate-300 group-hover:border-white/20 group-hover:bg-white/10"
                      }`}
                    >
                      <Icon size={17} />
                    </span>
                    <span>{item.label}</span>
                    {isActive ? (
                      <span className="absolute right-3 h-2 w-2 rounded-full bg-blue-300 shadow-[0_0_18px_2px_rgba(147,197,253,0.7)]" />
                    ) : null}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
