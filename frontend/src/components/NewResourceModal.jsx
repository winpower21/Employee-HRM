import { useState } from "react";
import apiRequest from "../services/api";

function NewResourceModal({ isOpen, onClose, onCreated, type }) {
  const config = {
    department: {
      title: "New Department",
      subtitle: "Add a department to your organisation",
      endpoint: "/department/new",
      namePlaceholder: "e.g. Engineering",
      descPlaceholder: "Brief description of this department",
    },
    position: {
      title: "New Position",
      subtitle: "Define a role within your organisation",
      endpoint: "/position/new",
      namePlaceholder: "e.g. Senior Developer",
      descPlaceholder: "Brief description of this position",
    },
  };
  const { title, subtitle, endpoint, namePlaceholder, descPlaceholder } =
    config[type];
  const [data, setData] = useState({ name: "", description: "" });
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await apiRequest(endpoint, "POST", data);
      onCreated(response.data);
      setData({ name: "", description: "" });
      onClose();
    } catch (error) {
      setError(error?.data?.detail || "Failed to create resource");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-60 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Name
              </span>
              <input
                name="name"
                placeholder={namePlaceholder}
                required
                value={data.name}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Description
              </span>
              <textarea
                name="description"
                placeholder={descPlaceholder}
                required
                value={data.description}
                onChange={handleChange}
                rows={3}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </label>

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
                disabled={submitting}
                className={`px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors ${
                  submitting
                    ? "bg-blue-300 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default NewResourceModal;
