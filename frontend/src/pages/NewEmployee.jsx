import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router";
import apiRequest from "../services/api";
import NewResourceModal from "../components/NewResourceModal";

function NewEmployee() {
  const navigate = useNavigate();

  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showPosModal, setShowPosModal] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [employeeData, setEmployeeData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    dob: "",
    email: "",
    phone: "",
    salary: "",
    department_id: "",
    position_id: "",
    hire_date: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [deptRes, posRes] = await Promise.all([
          apiRequest("/department/all", "GET"),
          apiRequest("/position/all", "GET"),
        ]);
        setDepartments(deptRes.data);
        setPositions(posRes.data);
      } catch (error) {
        setError(
          error?.data?.detail || "Failed to load positions and departments",
        );
      }
    };
    fetchDropdowns();
  }, []);

  const phoneError =
    employeeData.phone.startsWith("0") ? "Phone number cannot start with 0" : null;

  const handleChange = (e) => {
    setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
  };

  const handlePhoneChange = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
    setEmployeeData({ ...employeeData, phone: digits });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (phoneError) return;
    setSubmitting(true);
    setError(null);
    try {
      await apiRequest("/employees/new", "POST", {
        ...employeeData,
        salary: parseInt(employeeData.salary, 10),
        department_id: parseInt(employeeData.department_id, 10),
        position_id: parseInt(employeeData.position_id, 10),
        middle_name: employeeData.middle_name || undefined,
        hire_date: employeeData.hire_date || undefined,
      });
      window.alert("Employee created successfully");
      navigate("/employees");
    } catch (error) {
      window.alert("Error creating employee: ", error?.data?.detail);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full";
  const selectClass =
    "flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <NavLink
            to="/employees"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Employees
          </NavLink>
          <span className="text-gray-300 text-sm">/</span>
          <span className="text-sm text-gray-600">New Employee</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Add New Employee</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Fill in the details below to register a new employee
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {error && (
          <div className="mx-6 mt-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Personal Information */}
          <div className="px-6 py-5 flex flex-col gap-5">
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
                Personal Information
              </h2>
              <div className="flex flex-col gap-4">
                {/* Name row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      First Name
                    </span>
                    <input
                      name="first_name"
                      required
                      value={employeeData.first_name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Middle Name{" "}
                      <span className="normal-case font-normal">
                        (optional)
                      </span>
                    </span>
                    <input
                      name="middle_name"
                      value={employeeData.middle_name}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Last Name
                    </span>
                    <input
                      name="last_name"
                      required
                      value={employeeData.last_name}
                      onChange={handleChange}
                      className={inputClass}
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
                    value={employeeData.email}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </label>

                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Phone
                  </span>
                  <input
                    name="phone"
                    required
                    value={employeeData.phone}
                    onChange={handlePhoneChange}
                    inputMode="numeric"
                    className={`border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:border-transparent w-full ${
                      phoneError
                        ? "border-red-300 focus:ring-red-400"
                        : "border-gray-200 focus:ring-blue-500"
                    }`}
                  />
                  {phoneError && (
                    <p className="text-xs text-red-500 mt-0.5">{phoneError}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Date of Birth
                    </span>
                    <input
                      name="dob"
                      type="date"
                      required
                      value={employeeData.dob}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </label>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Hire Date{" "}
                      <span className="normal-case font-normal">
                        (optional)
                      </span>
                    </span>
                    <input
                      name="hire_date"
                      type="date"
                      value={employeeData.hire_date}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100" />

          {/* Role & Compensation */}
          <div className="px-6 py-5 flex flex-col gap-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Role & Compensation
            </h2>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                Salary
              </span>
              <input
                name="salary"
                type="number"
                required
                value={employeeData.salary}
                onChange={handleChange}
                className={inputClass}
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
                  value={employeeData.department_id}
                  onChange={handleChange}
                  disabled={departments.length === 0}
                  className={selectClass}
                >
                  <option value="">
                    {departments.length === 0
                      ? "No Departments"
                      : "Select Department"}
                  </option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowDeptModal(true)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors"
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
                  value={employeeData.position_id}
                  onChange={handleChange}
                  disabled={positions.length === 0}
                  className={selectClass}
                >
                  <option value="">
                    {positions.length === 0
                      ? "No Positions"
                      : "Select Position"}
                  </option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowPosModal(true)}
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap transition-colors"
                >
                  + New
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            <NavLink
              to="/employees"
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </NavLink>
            <button
              type="submit"
              disabled={submitting || !!phoneError}
              className={`px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors ${
                submitting || phoneError
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {submitting ? "Saving..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>

      <NewResourceModal
        isOpen={showDeptModal}
        onClose={() => setShowDeptModal(false)}
        type="department"
        onCreated={(newDept) => {
          setDepartments((prev) => [...prev, newDept]);
          setEmployeeData((prev) => ({ ...prev, department_id: newDept.id }));
        }}
      />
      <NewResourceModal
        isOpen={showPosModal}
        onClose={() => setShowPosModal(false)}
        type="position"
        onCreated={(newPos) => {
          setPositions((prev) => [...prev, newPos]);
          setEmployeeData((prev) => ({ ...prev, position_id: newPos.id }));
        }}
      />
    </div>
  );
}

export default NewEmployee;
