import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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

  const quickLinks = [
    { label: "Manage Users", to: "/users" },
    { label: "Manage Merchants", to: "/merchants" },
    { label: "Manage Accounts", to: "/accounts" },
    { label: "Manage Transactions", to: "/transactions" },
    { label: "Manage Payments", to: "/payments" },
    { label: "Open Reports", to: "/reports" },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="View summary of records and quickly navigate to each module."
      />

      {error ? (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Users" value={loading ? "..." : stats.users} colorClass="bg-blue-600" />
        <StatCard
          label="Total Merchants"
          value={loading ? "..." : stats.merchants}
          colorClass="bg-emerald-600"
        />
        <StatCard
          label="Total Accounts"
          value={loading ? "..." : stats.accounts}
          colorClass="bg-amber-500"
        />
        <StatCard
          label="Total Transactions"
          value={loading ? "..." : stats.transactions}
          colorClass="bg-purple-600"
        />
        <StatCard
          label="Total Payments"
          value={loading ? "..." : stats.payments}
          colorClass="bg-rose-600"
        />
      </div>

      <div className="mt-6 rounded-lg bg-white p-5 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800">Quick Navigation</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
