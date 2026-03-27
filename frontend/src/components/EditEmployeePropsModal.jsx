import { useState, useEffect } from "react";
import apiRequest from "../services/api";
import NewResourceModal from "./NewResourceModal";

function EditEmployeePropsModal({ isOpen, onClose, employee, onUpdated }) {
  const [form, setForm] = useState({
    salary: employee?.salary ?? "",
    department_id: employee?.department?.id ?? "",
    position_id: employee?.position?.id ?? "",
  });
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showPosModal, setShowPosModal] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const fetchDropdowns = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          apiRequest("/department/all", "GET"),
          apiRequest("/position/all", "GET"),
        ]);
        setDepartments(deptRes.data);
        setPositions(posRes.data);
      } catch (error) {
        setError(error?.data?.detail || "Failed to load dropdowns");
      }
    };
    fetchDropdowns();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiRequest(
        `/employees/update/${employee.emp_id}`,
        "PATCH",
        {
          salary: parseInt(form.salary, 10),
          department_id: parseInt(form.department_id, 10),
          position_id: parseInt(form.position_id, 10),
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
        className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Edit Employee Properties
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Update role and compensation
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
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Salary
              </span>
              <input
                name="salary"
                type="number"
                required
                value={form.salary}
                onChange={handleChange}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
      focus:ring-blue-500 focus:border-transparent"
              />
            </label>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Department
              </span>
              <div className="flex gap-2">
                <select
                  name="department_id"
                  required
                  value={form.department_id}
                  onChange={handleChange}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
      focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowDeptModal(true)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap
       transition-colors"
                >
                  + New
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Position
              </span>
              <div className="flex gap-2">
                <select
                  name="position_id"
                  required
                  value={form.position_id}
                  onChange={handleChange}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2
      focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select Position</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowPosModal(true)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap
       transition-colors"
                >
                  + New
                </button>
              </div>
            </div>

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
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      <NewResourceModal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        type="department"
        onCreated={(newDept) => {
          setDepartments((prev) => [...prev, newDept]);
          setForm((prev) => ({ ...prev, department_id: newDept.id }));
        }}
      />
      <NewResourceModal
        isOpen={showPosModal}
        onClose={() => setShowPosModal(false)}
        type="position"
        onCreated={(newPos) => {
          setPositions((prev) => [...prev, newPos]);
          setForm((prev) => ({ ...prev, position_id: newPos.id }));
        }}
      />
    </div>
  );
}

export default EditEmployeePropsModal;
