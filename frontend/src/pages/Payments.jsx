import { useEffect, useRef, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";

const initialFormData = {
  transaction_id: "",
  payment_method: "UPI",
  payment_status: "Success",
  payment_date: "",
};

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const formRef = useRef(null);
  const isEditMode = editingId !== null;

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/payments");
      setPayments(response.data?.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.transaction_id.trim()) return "Transaction ID is required.";
    if (Number.isNaN(Number(formData.transaction_id))) return "Transaction ID must be a number.";
    if (!formData.payment_method.trim()) return "Payment method is required.";
    if (!formData.payment_status.trim()) return "Payment status is required.";
    if (!formData.payment_date.trim()) return "Payment date is required.";
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
      transaction_id: Number(formData.transaction_id),
    };

    try {
      setSubmitting(true);
      if (isEditMode) {
        await axiosInstance.put(`/payments/${editingId}`, payload);
        setSuccessMessage("Payment updated successfully.");
      } else {
        await axiosInstance.post("/payments", payload);
        setSuccessMessage("Payment added successfully.");
      }

      resetForm();
      await fetchPayments();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save payment.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (payment) => {
    setError("");
    setSuccessMessage("");
    setEditingId(payment.payment_id);
    setFormData({
      transaction_id: String(payment.transaction_id || ""),
      payment_method: payment.payment_method || "UPI",
      payment_status: payment.payment_status || "Success",
      payment_date: payment.payment_date ? String(payment.payment_date).slice(0, 10) : "",
    });
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this payment?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await axiosInstance.delete(`/payments/${id}`);
      setSuccessMessage("Payment deleted successfully.");
      await fetchPayments();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete payment.");
    }
  };

  const columns = [
    { key: "payment_id", label: "Payment ID" },
    { key: "transaction_id", label: "Transaction ID" },
    { key: "payment_method", label: "Method" },
    { key: "payment_status", label: "Status" },
    { key: "payment_date", label: "Date" },
  ];

  return (
    <div>
      <PageHeader title="Payments" subtitle="Create, update, view and delete payment records." />

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
          {isEditMode ? "Edit Payment" : "Add Payment"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <input
            type="text"
            name="transaction_id"
            value={formData.transaction_id}
            onChange={handleChange}
            placeholder="Transaction ID *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          >
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="NetBanking">NetBanking</option>
            <option value="Wallet">Wallet</option>
            <option value="Cash">Cash</option>
          </select>
          <select
            name="payment_status"
            value={formData.payment_status}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          >
            <option value="Success">Success</option>
            <option value="Pending">Pending</option>
            <option value="Failed">Failed</option>
          </select>
          <input
            type="date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleChange}
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />

          <div className="sm:col-span-2 lg:col-span-4 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? "Saving..." : isEditMode ? "Update Payment" : "Add Payment"}
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
        data={payments}
        loading={loading}
        emptyMessage="No payments found."
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
              onClick={() => handleDelete(row.payment_id)}
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

export default Payments;
