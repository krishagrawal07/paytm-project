import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";

const initialFormData = {
  user_id: "",
  account_number: "",
  account_type: "",
  balance: "0",
  created_at: "",
};

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const formRef = useRef(null);
  const isEditMode = editingId !== null;

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/accounts");
      setAccounts(response.data?.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.user_id.trim()) return "User ID is required.";
    if (Number.isNaN(Number(formData.user_id))) return "User ID must be a number.";
    if (!formData.account_number.trim()) return "Account number is required.";
    if (!formData.account_type.trim()) return "Account type is required.";
    if (formData.balance !== "" && Number.isNaN(Number(formData.balance))) {
      return "Balance must be a number.";
    }
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
      balance: formData.balance === "" ? 0 : Number(formData.balance),
      created_at: formData.created_at || null,
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await axiosInstance.put(`/accounts/${editingId}`, payload);
        setSuccessMessage("Account updated successfully.");
      } else {
        await axiosInstance.post("/accounts", payload);
        setSuccessMessage("Account added successfully.");
      }

      resetForm();
      await fetchAccounts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (account) => {
    setError("");
    setSuccessMessage("");
    setEditingId(account.account_id);
    setFormData({
      user_id: String(account.user_id || ""),
      account_number: account.account_number || "",
      account_type: account.account_type || "",
      balance:
        account.balance === null || account.balance === undefined
          ? "0"
          : String(account.balance),
      created_at: account.created_at ? String(account.created_at).slice(0, 10) : "",
    });
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this account?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await axiosInstance.delete(`/accounts/${id}`);
      setSuccessMessage("Account deleted successfully.");
      await fetchAccounts();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete account.");
    }
  };

  const columns = [
    { key: "account_id", label: "Account ID" },
    { key: "user_id", label: "User ID" },
    { key: "account_number", label: "Account Number" },
    { key: "account_type", label: "Account Type" },
    { key: "balance", label: "Balance" },
    { key: "created_at", label: "Created At" },
  ];

  return (
    <div>
      <PageHeader
        title="Accounts"
        subtitle="Create, update, view and delete account records."
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
          {isEditMode ? "Edit Account" : "Add Account"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
            name="account_number"
            value={formData.account_number}
            onChange={handleChange}
            placeholder="Account Number *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="text"
            name="account_type"
            value={formData.account_type}
            onChange={handleChange}
            placeholder="Account Type *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="number"
            step="0.01"
            name="balance"
            value={formData.balance}
            onChange={handleChange}
            placeholder="Balance"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="date"
            name="created_at"
            value={formData.created_at}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />

          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? "Saving..." : isEditMode ? "Update Account" : "Add Account"}
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
        data={accounts}
        loading={loading}
        emptyMessage="No accounts found."
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
              onClick={() => handleDelete(row.account_id)}
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

export default Accounts;
