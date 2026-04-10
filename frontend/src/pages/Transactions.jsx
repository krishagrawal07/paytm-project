import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";

const initialFormData = {
  user_id: "",
  merchant_id: "",
  account_id: "",
  amount: "",
  transaction_type: "",
  transaction_status: "Completed",
  transaction_date: "",
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const formRef = useRef(null);
  const isEditMode = editingId !== null;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/transactions");
      setTransactions(response.data?.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch transactions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.user_id.trim()) return "User ID is required.";
    if (Number.isNaN(Number(formData.user_id))) return "User ID must be a number.";
    if (!formData.merchant_id.trim()) return "Merchant ID is required.";
    if (Number.isNaN(Number(formData.merchant_id))) return "Merchant ID must be a number.";
    if (!formData.account_id.trim()) return "Account ID is required.";
    if (Number.isNaN(Number(formData.account_id))) return "Account ID must be a number.";
    if (!formData.amount.trim()) return "Amount is required.";
    if (Number.isNaN(Number(formData.amount))) return "Amount must be a number.";
    if (!formData.transaction_status.trim()) return "Transaction status is required.";
    if (!formData.transaction_date.trim()) return "Transaction date is required.";
    return "";
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const payload = {
      ...formData,
      user_id: Number(formData.user_id),
      merchant_id: Number(formData.merchant_id),
      account_id: Number(formData.account_id),
      amount: Number(formData.amount),
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await axiosInstance.put(`/transactions/${editingId}`, payload);
        setSuccessMessage("Transaction updated successfully.");
      } else {
        await axiosInstance.post("/transactions", payload);
        setSuccessMessage("Transaction added successfully.");
      }

      resetForm();
      await fetchTransactions();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (transaction) => {
    setError("");
    setSuccessMessage("");
    setEditingId(transaction.transaction_id);
    setFormData({
      user_id: String(transaction.user_id || ""),
      merchant_id: String(transaction.merchant_id || ""),
      account_id: String(transaction.account_id || ""),
      amount:
        transaction.amount === null || transaction.amount === undefined
          ? ""
          : String(transaction.amount),
      transaction_type: transaction.transaction_type || "",
      transaction_status: transaction.transaction_status || "Completed",
      transaction_date: transaction.transaction_date
        ? String(transaction.transaction_date).slice(0, 10)
        : "",
    });
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await axiosInstance.delete(`/transactions/${id}`);
      setSuccessMessage("Transaction deleted successfully.");
      await fetchTransactions();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete transaction.");
    }
  };

  const columns = [
    { key: "transaction_id", label: "Transaction ID" },
    { key: "user_id", label: "User ID" },
    { key: "merchant_id", label: "Merchant ID" },
    { key: "account_id", label: "Account ID" },
    { key: "amount", label: "Amount" },
    { key: "transaction_type", label: "Type" },
    { key: "transaction_status", label: "Status" },
    { key: "transaction_date", label: "Date" },
  ];

  return (
    <div>
      <PageHeader
        title="Transactions"
        subtitle="Create, update, view and delete transaction records."
      />

      {error ? (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {successMessage ? (
        <p className="mb-4 rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}

      <div ref={formRef} className="mb-6 rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-800">
          {isEditMode ? "Edit Transaction" : "Add Transaction"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            placeholder="User ID *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="text"
            name="merchant_id"
            value={formData.merchant_id}
            onChange={handleChange}
            placeholder="Merchant ID *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="text"
            name="account_id"
            value={formData.account_id}
            onChange={handleChange}
            placeholder="Account ID *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="number"
            step="0.01"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Amount *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="text"
            name="transaction_type"
            value={formData.transaction_type}
            onChange={handleChange}
            placeholder="Transaction Type"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <select
            name="transaction_status"
            value={formData.transaction_status}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          >
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <input
            type="date"
            name="transaction_date"
            value={formData.transaction_date}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />

          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? "Saving..." : isEditMode ? "Update Transaction" : "Add Transaction"}
            </button>
            {isEditMode ? (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-md bg-slate-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Cancel Edit
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <DataTable
        columns={columns}
        data={transactions}
        loading={loading}
        emptyMessage="No transactions found."
        renderActions={(row) => (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleEdit(row)}
              className="rounded bg-amber-500 px-3 py-1 text-xs font-semibold text-white hover:bg-amber-600"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.transaction_id)}
              className="rounded bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default Transactions;
