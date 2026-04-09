import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";

const initialFormData = {
  merchant_name: "",
  category: "",
  email: "",
  phone: "",
  address: "",
};

const Merchants = () => {
  const [merchants, setMerchants] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/merchants");
      setMerchants(response.data?.data || []);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to fetch merchants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchants();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.merchant_name.trim()) return "Merchant name is required.";
    if (!formData.category.trim()) return "Category is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Enter a valid email.";
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

    try {
      setSubmitting(true);
      if (editingId) {
        await axiosInstance.put(`/merchants/${editingId}`, formData);
        setSuccessMessage("Merchant updated successfully.");
      } else {
        await axiosInstance.post("/merchants", formData);
        setSuccessMessage("Merchant added successfully.");
      }

      resetForm();
      fetchMerchants();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to save merchant.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (merchant) => {
    setError("");
    setSuccessMessage("");
    setEditingId(merchant.merchant_id);
    setFormData({
      merchant_name: merchant.merchant_name || "",
      category: merchant.category || "",
      email: merchant.email || "",
      phone: merchant.phone || "",
      address: merchant.address || "",
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this merchant?");
    if (!confirmed) return;

    try {
      setError("");
      setSuccessMessage("");
      await axiosInstance.delete(`/merchants/${id}`);
      setSuccessMessage("Merchant deleted successfully.");
      fetchMerchants();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to delete merchant.");
    }
  };

  const columns = [
    { key: "merchant_id", label: "Merchant ID" },
    { key: "merchant_name", label: "Merchant Name" },
    { key: "category", label: "Category" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "address", label: "Address" },
  ];

  return (
    <div>
      <PageHeader
        title="Merchants"
        subtitle="Create, update, view and delete merchant records."
      />

      {error ? (
        <p className="mb-4 rounded-md bg-red-100 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {successMessage ? (
        <p className="mb-4 rounded-md bg-green-100 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </p>
      ) : null}

      <div className="mb-6 rounded-lg bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-slate-800">
          {editingId ? "Edit Merchant" : "Add Merchant"}
        </h3>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <input
            type="text"
            name="merchant_name"
            value={formData.merchant_name}
            onChange={handleChange}
            placeholder="Merchant Name *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="Category *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email *"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Phone"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="rounded-md border border-slate-300 px-3 py-2 outline-none ring-blue-500 focus:ring-2 sm:col-span-2"
          />

          <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
            >
              {submitting ? "Saving..." : editingId ? "Update Merchant" : "Add Merchant"}
            </button>
            {editingId ? (
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
        data={merchants}
        loading={loading}
        emptyMessage="No merchants found."
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
              onClick={() => handleDelete(row.merchant_id)}
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

export default Merchants;
