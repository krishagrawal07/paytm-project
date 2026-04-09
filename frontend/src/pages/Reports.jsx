import { useMemo, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";

const reportList = [
  {
    key: "top-users-transactions",
    title: "Top Users by Transactions",
    description: "Users with more than 10 transactions.",
  },
  {
    key: "users-with-payments",
    title: "Users with Payments",
    description: "Users with at least one payment.",
  },
  {
    key: "amazon-transactions-2023",
    title: "Amazon Transactions 2023",
    description: "Transactions made with Amazon in 2023.",
  },
  {
    key: "user-email-transaction",
    title: "Email and Transaction ID",
    description: "User email and transaction ID listing.",
  },
  {
    key: "merchants-no-transactions",
    title: "Merchants with No Transactions",
    description: "Merchants that have no transaction records.",
  },
  {
    key: "zomato-users",
    title: "Users Paid to Zomato",
    description: "Users who made payments to Zomato.",
  },
  {
    key: "ecommerce-users",
    title: "E-commerce Users",
    description: "Users who transacted with E-commerce merchants.",
  },
  {
    key: "highest-average-merchant",
    title: "Highest Average Merchant",
    description: "Merchant with highest average transaction value.",
  },
  {
    key: "users-more-than-5-payments",
    title: "Users with > 5 Payments",
    description: "Users who made more than 5 payments.",
  },
  {
    key: "merchant-commission",
    title: "Merchant Commission",
    description: "Total 2% commission by merchant.",
  },
];

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    } catch (apiError) {
      setReportData([]);
      setError(apiError.response?.data?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports and Analytics"
        subtitle="Run case study report queries and view results instantly."
      />

      {error ? (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reportList.map((report) => (
          <button
            type="button"
            key={report.key}
            onClick={() => loadReport(report)}
            className={`rounded-lg border p-4 text-left shadow-sm transition ${
              selectedReport?.key === report.key
                ? "border-blue-500 bg-blue-50"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <h3 className="text-sm font-bold text-slate-800">{report.title}</h3>
            <p className="mt-1 text-xs text-slate-500">{report.description}</p>
          </button>
        ))}
      </div>

      {selectedReport ? (
        <div>
          <h3 className="mb-3 text-lg font-bold text-slate-800">{selectedReport.title}</h3>
          <DataTable
            columns={columns}
            data={reportData}
            loading={loading}
            emptyMessage="No data found for this report."
          />
        </div>
      ) : (
        <div className="rounded-lg bg-white p-6 text-sm text-slate-600 shadow-sm">
          Select any report card above to view analytics data.
        </div>
      )}
    </div>
  );
};

export default Reports;
