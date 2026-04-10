import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Sparkles,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";

const reportList = [
  {
    key: "top-users-transactions",
    title: "Top Users by Transactions",
    description: "Users with more than 10 transactions.",
    icon: TrendingUp,
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    key: "users-with-payments",
    title: "Users with Payments",
    description: "Users with at least one payment.",
    icon: Users,
    gradient: "from-emerald-500 to-green-600",
  },
  {
    key: "amazon-transactions-2023",
    title: "Amazon Transactions 2023",
    description: "Transactions made with Amazon in 2023.",
    icon: BarChart3,
    gradient: "from-violet-500 to-purple-600",
  },
  {
    key: "user-email-transaction",
    title: "Email and Transaction ID",
    description: "User email and transaction ID listing.",
    icon: Users,
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    key: "merchants-no-transactions",
    title: "Merchants with No Transactions",
    description: "Merchants that have no transaction records.",
    icon: Store,
    gradient: "from-amber-500 to-orange-600",
  },
  {
    key: "zomato-users",
    title: "Users Paid to Zomato",
    description: "Users who made payments to Zomato.",
    icon: Users,
    gradient: "from-pink-500 to-rose-600",
  },
  {
    key: "ecommerce-users",
    title: "E-commerce Users",
    description: "Users who transacted with E-commerce merchants.",
    icon: Sparkles,
    gradient: "from-sky-500 to-cyan-600",
  },
  {
    key: "highest-average-merchant",
    title: "Highest Average Merchant",
    description: "Merchant with highest average transaction value.",
    icon: TrendingUp,
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    key: "users-more-than-5-payments",
    title: "Users with > 5 Payments",
    description: "Users who made more than 5 payments.",
    icon: Users,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    key: "merchant-commission",
    title: "Merchant Commission",
    description: "Total 2% commission by merchant.",
    icon: BarChart3,
    gradient: "from-rose-500 to-red-600",
  },
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const columns = useMemo(() => {
    if (!reportData.length) return [];
    return Object.keys(reportData[0]).map((key) => ({
      key,
      label: key
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" "),
    }));
  }, [reportData]);

  const loadReport = async (report) => {
    try {
      setSelectedReport(report);
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(`/reports/${report.key}`);
      setReportData(response.data?.data || []);
      setToast({ type: "success", message: `${report.title} loaded successfully.` });
    } catch (apiError) {
      const message = apiError.response?.data?.message || "Failed to load report.";
      setReportData([]);
      setError(message);
      setToast({ type: "error", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 sm:right-6 sm:top-6">
          <div
            className={`flex items-start gap-2 rounded-xl border px-4 py-3 text-sm shadow-xl ${
              toast.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      ) : null}

      <PageHeader
        title="Reports and Analytics"
        subtitle="Run case-study SQL insights in one click and analyze results in a modern dashboard table."
        badge="Reports"
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reportList.map((report) => {
          const Icon = report.icon;
          const isSelected = selectedReport?.key === report.key;
          const isLoadingThis = loading && isSelected;

          return (
            <article
              key={report.key}
              className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                isSelected ? "border-blue-300 shadow-blue-100/60" : "border-slate-200"
              }`}
            >
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${report.gradient}`} />

              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${report.gradient} text-white shadow-md`}
                >
                  <Icon size={18} />
                </span>
                {isSelected ? (
                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                    Active
                  </span>
                ) : null}
              </div>

              <h3 className="mt-3 text-sm font-semibold text-slate-900">{report.title}</h3>
              <p className="mt-1 text-xs text-slate-500">{report.description}</p>

              <button
                type="button"
                onClick={() => loadReport(report)}
                disabled={isLoadingThis}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-md transition-all duration-300 hover:shadow-lg hover:shadow-blue-200/60 disabled:opacity-70"
              >
                {isLoadingThis ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <PlayCircle size={14} />
                    Run Report
                  </>
                )}
              </button>
            </article>
          );
        })}
      </section>

      <section className="space-y-3">
        {selectedReport ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                {selectedReport.title} Results
              </h3>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                Rows: {reportData.length}
              </span>
            </div>

            <DataTable
              columns={columns}
              data={reportData}
              loading={loading}
              emptyMessage="No data found for this report."
              searchPlaceholder="Search report results..."
              initialPageSize={10}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              Select a report card above and click <span className="font-semibold">Run Report</span>{" "}
              to view analytics.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Reports;
