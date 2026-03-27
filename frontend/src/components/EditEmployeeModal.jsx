import { useState } from "react";
import apiRequest from "../services/api";

function EditEmployeeModal({ isOpen, onClose, employee, onUpdated }) {
  const [form, setForm] = useState({
    first_name: employee?.first_name ?? "",
    middle_name: employee?.middle_name ?? "",
    last_name: employee?.last_name ?? "",
    dob: employee?.dob ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const phoneError = form.phone.startsWith("0")
    ? "Phone number cannot start with 0"
    : null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setForm({ ...form, phone: digits });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneError) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest(
        `/employees/update/${employee.emp_id}`,
        "PUT",
        {
          ...form,
          middle_name: form.middle_name || undefined,
        },
      );
      onUpdated(res.data);
      onClose();
    } catch (error) {
      setError(error?.data?.detail || "Failed to update employee");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Employee Details
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Update personal information
          </p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  First Name
                </span>
                <input
                  name="first_name"
                  required
                  value={form.first_name}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
     focus:ring-blue-500 focus:border-transparent"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Middle Name{" "}
                  <span className="normal-case font-normal">(optional)</span>
                </span>
                <input
                  name="middle_name"
                  value={form.middle_name}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
     focus:ring-blue-500 focus:border-transparent"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Last Name
                </span>
                <input
                  name="last_name"
                  required
                  value={form.last_name}
                  onChange={handleChange}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
     focus:ring-blue-500 focus:border-transparent"
                />
              </label>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Email
              </span>
              <input
                name="email"
                type="email"
                required
                value={form.email}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
     focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Phone
              </span>
              <input
                name="phone"
                required
                value={form.phone}
                onChange={handlePhoneChange}
                inputMode="numeric"
                className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent ${
                  phoneError
                    ? "border-red-300 focus:ring-red-400"
                    : "border-gray-200 focus:ring-blue-500"
                }`}
              />
              {phoneError && (
                <p className="text-xs text-red-500 mt-0.5">{phoneError}</p>
              )}
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Date of Birth
              </span>
              <input
                name="dob"
                type="date"
                required
                value={form.dob}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
     focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            {/* Footer actions inside form so submit works */}
            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !!phoneError}
                className={`px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors ${
                  submitting || phoneError
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
export default EditEmployeeModal;
