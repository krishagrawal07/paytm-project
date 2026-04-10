import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CreditCard,
  Receipt,
  Store,
  Users,
  Wallet,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import PageHeader from "../components/PageHeader";
import StatCard from "../components/StatCard";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    merchants: 0,
    accounts: 0,
    transactions: 0,
    payments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError("");

      const [usersRes, merchantsRes, accountsRes, transactionsRes, paymentsRes] =
        await Promise.all([
          axiosInstance.get("/users"),
          axiosInstance.get("/merchants"),
          axiosInstance.get("/accounts"),
          axiosInstance.get("/transactions"),
          axiosInstance.get("/payments"),
        ]);

      setStats({
        users: usersRes.data?.data?.length || 0,
        merchants: merchantsRes.data?.data?.length || 0,
        accounts: accountsRes.data?.data?.length || 0,
        transactions: transactionsRes.data?.data?.length || 0,
        payments: paymentsRes.data?.data?.length || 0,
      });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const statCards = useMemo(
    () => [
      { label: "Total Users", value: stats.users, icon: Users, variant: "blue" },
      { label: "Total Merchants", value: stats.merchants, icon: Store, variant: "green" },
      { label: "Total Accounts", value: stats.accounts, icon: Wallet, variant: "amber" },
      { label: "Transactions", value: stats.transactions, icon: Receipt, variant: "purple" },
      { label: "Payments", value: stats.payments, icon: CreditCard, variant: "red" },
    ],
    [stats]
  );

  const quickLinks = [
    {
      label: "Manage Users",
      description: "Create and maintain customer profiles",
      to: "/users",
      icon: Users,
      gradient: "from-blue-500 to-indigo-500",
    },
    {
      label: "Manage Merchants",
      description: "Onboard and update merchant records",
      to: "/merchants",
      icon: Store,
      gradient: "from-emerald-500 to-green-500",
    },
    {
      label: "Manage Accounts",
      description: "Review balances and account metadata",
      to: "/accounts",
      icon: Wallet,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      label: "Manage Transactions",
      description: "Track and resolve transaction events",
      to: "/transactions",
      icon: Receipt,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      label: "Manage Payments",
      description: "Inspect payment methods and status",
      to: "/payments",
      icon: CreditCard,
      gradient: "from-rose-500 to-red-500",
    },
    {
      label: "Open Reports",
      description: "Run advanced case study analytics",
      to: "/reports",
      icon: BarChart3,
      gradient: "from-cyan-500 to-blue-500",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        subtitle="Monitor key entities, jump into modules, and keep your Paytm DBMS data in sync."
        badge="Control Center"
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statCards.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={loading ? "..." : item.value}
            icon={item.icon}
            variant={item.variant}
          />
        ))}
      </div>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">Quick Navigation</h3>
          <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Productivity shortcuts
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-100/60"
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${link.gradient}`}
                />

                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${link.gradient} text-white shadow-md`}
                  >
                    <Icon size={18} />
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-slate-400 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-slate-700"
                  />
                </div>

                <h4 className="mt-3 text-sm font-semibold text-slate-900">{link.label}</h4>
                <p className="mt-1 text-xs text-slate-500">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
