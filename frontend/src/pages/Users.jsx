import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import axiosInstance from "../api/axiosInstance";
import DataTable from "../components/DataTable";
import PageHeader from "../components/PageHeader";

const initialFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  country: "",
};

const inputClassName =
  "peer w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100";

const UserFormField = ({ label, name, value, onChange, type = "text", required = false }) => {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={inputClassName}
        placeholder={`Enter ${label.toLowerCase()}`}
      />
    </label>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const formRef = useRef(null);
  const isEditMode = editingId !== null;

  const showToast = (type, message) => {
    setToast({ type, message });
  };

  useEffect(() => {
    if (!toast) return undefined;

    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get("/users");
      setUsers(response.data?.data || []);
    } catch (apiError) {
      const message = apiError.response?.data?.message || "Failed to fetch users.";
      setError(message);
      showToast("error", message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) return "First name is required.";
    if (!formData.last_name.trim()) return "Last name is required.";
    if (!formData.email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Enter a valid email.";
    if (!formData.phone.trim()) return "Phone is required.";
    return "";
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const validationMessage = validateForm();
    if (validationMessage) {
      setError(validationMessage);
      showToast("error", validationMessage);
      return;
    }

    try {
      setSubmitting(true);

      if (isEditMode) {
        await axiosInstance.put(`/users/${editingId}`, formData);
        showToast("success", "User updated successfully.");
      } else {
        await axiosInstance.post("/users", formData);
        showToast("success", "User added successfully.");
      }

      resetForm();
      await fetchUsers();
    } catch (apiError) {
      const message = apiError.response?.data?.message || "Failed to save user.";
      setError(message);
      showToast("error", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setError("");
    setEditingId(user.user_id);
    setFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
      state: user.state || "",
      country: user.country || "",
    });

    showToast("success", `Editing user #${user.user_id}`);
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) return;

    try {
      setError("");
      await axiosInstance.delete(`/users/${id}`);
      showToast("success", "User deleted successfully.");
      await fetchUsers();
    } catch (apiError) {
      const message = apiError.response?.data?.message || "Failed to delete user.";
      setError(message);
      showToast("error", message);
    }
  };

  const columns = useMemo(
    () => [
      { key: "user_id", label: "User ID" },
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "city", label: "City" },
      { key: "state", label: "State" },
      { key: "country", label: "Country" },
    ],
    []
  );

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
            <button
              type="button"
              onClick={() => setToast(null)}
              className="ml-2 rounded-md p-1 transition hover:bg-black/5"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : null}

      <PageHeader
        title="User Management"
        subtitle="Create, update, search, and maintain user records through a premium admin workflow."
        badge="Users"
      />

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <section
        ref={formRef}
        className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-lg shadow-slate-200/50 sm:p-6"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
              {isEditMode ? "Edit User" : "Add New User"}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {isEditMode
                ? "Update selected user information and save changes."
                : "Enter user details and add a new record."}
            </p>
          </div>
          {isEditMode ? (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              Editing ID: {editingId}
            </span>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <UserFormField
            label="First Name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <UserFormField
            label="Last Name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <UserFormField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
            required
          />
          <UserFormField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <UserFormField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
          <UserFormField label="City" name="city" value={formData.city} onChange={handleChange} />
          <UserFormField label="State" name="state" value={formData.state} onChange={handleChange} />
          <UserFormField
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />

          <div className="flex flex-wrap items-center gap-3 md:col-span-2 xl:col-span-4">
            <button
              type="submit"
              disabled={submitting}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all duration-300 ${
                isEditMode
                  ? "bg-gradient-to-r from-emerald-500 to-green-600 hover:shadow-emerald-200/70"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-blue-200/70"
              } disabled:cursor-not-allowed disabled:opacity-70`}
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {submitting ? "Saving..." : isEditMode ? "Update User" : "Add User"}
            </button>

            {isEditMode ? (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <X size={16} />
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No user records found."
        searchPlaceholder="Search users by name, email, city..."
        initialPageSize={8}
        pageSizeOptions={[5, 8, 10, 20, 50]}
        renderActions={(row) => (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleEdit(row)}
              className="inline-flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(row.user_id)}
              className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      />
    </div>
  );
};

export default Users;
