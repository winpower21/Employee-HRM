import { useState, useEffect } from "react";
import apiRequest from "../services/api";
import NewResourceModal from "../components/NewResourceModal";
import EditResourceModal from "../components/EditResourceModal";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 15;

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);

  const [showNewModal, setShowNewModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await apiRequest("/department/all", "GET");
        setDepartments(res.data);
      } catch (error) {
        setError(error?.data?.detail || "Failed to load departments");
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
  }, []);

  const handleDelete = async (dept) => {
    if (!window.confirm(`Remove department "${dept.name}"?`)) return;
    try {
      await apiRequest(`/department/delete/${dept.id}`, "DELETE");
      setDepartments((prev) => prev.filter((d) => d.id !== dept.id));
    } catch (error) {
      window.alert(error?.data?.detail || "Failed to delete department");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <p className="text-sm text-gray-400">Loading departments...</p>
      </div>
    );
  }

  const totalPages = Math.ceil(departments.length / PAGE_SIZE);
  const paginated = departments.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Departments</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {departments.length} department{departments.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            New Department
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {departments.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-16 text-center">
          <p className="text-sm text-gray-400 mb-4">No departments yet.</p>
          {isAdmin && (
            <button
              onClick={() => setShowNewModal(true)}
              className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Add First Department
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
          {/* List header */}
          <div
            className={`grid ${isAdmin ? "grid-cols-[1fr_2fr_auto]" : "grid-cols-[1fr_2fr]"} gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50`}
          >
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Name
            </span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Description
            </span>
            {isAdmin && (
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
                Actions
              </span>
            )}
          </div>

          {/* Rows */}
          <ul className="divide-y divide-gray-50">
            {paginated.map((dept) => {
              const employeeCount = dept.employees?.length ?? 0;
              const canDelete = employeeCount === 0;

              return (
                <li
                  key={dept.id}
                  className={`grid ${isAdmin ? "grid-cols-[1fr_2fr_auto]" : "grid-cols-[1fr_2fr]"} gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {dept.name}
                    </p>
                    <span
                      className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                        employeeCount > 0
                          ? "bg-blue-50 text-blue-600 border border-blue-100"
                          : "bg-gray-50 text-gray-400 border border-gray-100"
                      }`}
                    >
                      {employeeCount} employee{employeeCount !== 1 ? "s" : ""}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2">
                    {dept.description}
                  </p>

                  {isAdmin && (
                    <div className="flex items-center gap-2 justify-end">
                      <button
                        onClick={() => setEditingItem(dept)}
                        className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 transition-colors font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => canDelete && handleDelete(dept)}
                        disabled={!canDelete}
                        title={
                          !canDelete
                            ? `Cannot delete — ${employeeCount} employee${employeeCount !== 1 ? "s" : ""} assigned`
                            : "Delete department"
                        }
                        className={`px-3 py-1.5 text-xs rounded-lg border font-medium transition-colors ${
                          canDelete
                            ? "border-red-100 text-red-500 hover:bg-red-50"
                            : "border-gray-100 text-gray-300 cursor-not-allowed"
                        }`}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-6">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 0}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages - 1}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {isAdmin && (
        <NewResourceModal
          isOpen={showNewModal}
          onClose={() => setShowNewModal(false)}
          type="department"
          onCreated={(newDept) =>
            setDepartments((prev) => [...prev, { ...newDept, employees: [] }])
          }
        />
      )}

      {isAdmin && editingItem && (
        <EditResourceModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          type="department"
          item={editingItem}
          onUpdated={(updated) => {
            setDepartments((prev) =>
              prev.map((d) =>
                d.id === updated.id
                  ? { ...updated, employees: d.employees }
                  : d,
              ),
            );
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}

export default Departments;
