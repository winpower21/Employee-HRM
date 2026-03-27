import { useState, useEffect } from "react";
import { NavLink } from "react-router";
import apiRequest from "../services/api";
import EditEmployeeModal from "../components/EditEmployeeModal";
import EditEmployeePropsModal from "../components/EditEmployeePropsModal";
import { useAuth } from "../hooks/useAuth";

const PAGE_SIZE = 10;

function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);

  const [editingEmployee, setEditingEmployee] = useState(null);
  const [editingPropsEmployee, setEditingPropsEmployee] = useState(null);

  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiRequest("/employees/all", "GET");
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees: ", error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    setPage(0);
  }, [search]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this employee?"))
      return;
    try {
      await apiRequest(`/employees/delete/${id}`, "DELETE");
      setEmployees((prev) => prev.filter((emp) => emp.emp_id !== id));
    } catch (error) {
      window.alert(error?.data?.detail || "Failed to delete employee");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <p className="text-sm text-gray-400">Loading employees...</p>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-160px)] gap-4">
        <p className="text-gray-500 text-sm">
          {error?.data?.detail || "No employees found"}
        </p>
        {isAdmin && (
          <NavLink
            to="/add-employee"
            className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors"
          >
            Add First Employee
          </NavLink>
        )}
      </div>
    );
  }

  const filtered = employees.filter((emp) => {
    const q = search.toLowerCase();
    const fullName =
      `${emp.first_name} ${emp.middle_name ?? ""} ${emp.last_name}`.toLowerCase();
    return (
      fullName.includes(q) ||
      emp.department.name.toLowerCase().includes(q) ||
      emp.position.name.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {filtered.length} of {employees.length} employee
            {employees.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, department or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {isAdmin && (
            <NavLink
              to="/add-employee"
              className="px-4 py-2 text-sm rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 transition-colors whitespace-nowrap"
            >
              New Employee
            </NavLink>
          )}
        </div>
      </div>

      {/* Employee grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-gray-400">
            No employees match your search.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((emp) => (
            <div
              key={emp.emp_id}
              className="bg-white border border-gray-100 rounded-xl shadow-sm flex flex-col gap-0 overflow-hidden"
            >
              {/* Card header */}
              <div className="px-4 pt-4 pb-3 border-b border-gray-50">
                <h2 className="text-base font-semibold text-gray-800 truncate">
                  {emp.first_name} {emp.middle_name} {emp.last_name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-md px-2 py-0.5 truncate">
                    {emp.department.name}
                  </span>
                  <span className="text-gray-200 text-xs">·</span>
                  <span className="text-xs text-gray-400 truncate">
                    {emp.position.name}
                  </span>
                </div>
              </div>

              {/* Card body */}
              <div className="px-4 py-3 flex justify-between text-xs text-gray-500 gap-2 flex-1">
                <div className="flex flex-col gap-1.5">
                  <p className="truncate">{emp.email}</p>
                  <p>{emp.phone}</p>
                  <p>DOB: {emp.dob}</p>
                </div>
                <div className="flex flex-col gap-1.5 text-right">
                  <p className="font-medium text-gray-700">
                    ₹{emp.salary.toLocaleString()}
                  </p>
                  <p>Hired: {emp.hire_date ?? "—"}</p>
                </div>
              </div>

              {/* Card footer */}
              {isAdmin && (
                <div className="px-4 pb-4 pt-2 border-t border-gray-50 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingEmployee(emp)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Edit Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingPropsEmployee(emp)}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-blue-100 text-blue-600 hover:bg-blue-50 transition-colors font-medium"
                  >
                    Edit Role
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(emp.emp_id)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-colors font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-3 mt-8">
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

      {isAdmin && editingEmployee && (
        <EditEmployeeModal
          isOpen={true}
          onClose={() => setEditingEmployee(null)}
          employee={editingEmployee}
          onUpdated={(updated) => {
            setEmployees((prev) =>
              prev.map((emp) =>
                emp.emp_id === updated.emp_id ? updated : emp,
              ),
            );
            setEditingEmployee(null);
          }}
        />
      )}

      {isAdmin && editingPropsEmployee && (
        <EditEmployeePropsModal
          isOpen={true}
          onClose={() => setEditingPropsEmployee(null)}
          employee={editingPropsEmployee}
          onUpdated={(updated) => {
            setEmployees((prev) =>
              prev.map((emp) =>
                emp.emp_id === updated.emp_id ? updated : emp,
              ),
            );
            setEditingPropsEmployee(null);
          }}
        />
      )}
    </div>
  );
}

export default Employees;
