import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Users", path: "/users" },
  { label: "Merchants", path: "/merchants" },
  { label: "Accounts", path: "/accounts" },
  { label: "Transactions", path: "/transactions" },
  { label: "Payments", path: "/payments" },
  { label: "Reports", path: "/reports" },
];

const Sidebar = () => {
  return (
    <aside className="w-full bg-slate-900 text-white md:fixed md:inset-y-0 md:left-0 md:w-64">
      <div className="border-b border-slate-700 px-4 py-4">
        <h2 className="text-xl font-bold">Paytm Project</h2>
        <p className="text-xs text-slate-300">College DBMS Case Study</p>
      </div>

      <nav className="flex gap-2 overflow-x-auto px-3 py-3 md:flex-col md:overflow-visible">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-200 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
