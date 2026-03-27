import { useState, useEffect } from "react";
import apiRequest from "../services/api";
import { useAuth } from "../hooks/useAuth";

function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiRequest("/users/all", "GET");
        setUsers(res.data);
      } catch (error) {
        setError(error?.data?.detail || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      const res = await apiRequest(`/users/${userId}/role`, "PATCH", {
        role: newRole,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: res.data.role } : u)),
      );
    } catch (error) {
      window.alert(error?.data?.detail || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <p className="text-sm text-gray-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {users.length} user{users.length !== 1 ? "s" : ""}
        </p>
      </div>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_auto] gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Name
          </span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Email
          </span>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">
            Role
          </span>
        </div>

        <ul className="divide-y divide-gray-50">
          {users.map((u) => {
            const isSelf = u.id === currentUser?.id;
            return (
              <li
                key={u.id}
                className="grid grid-cols-[1fr_1fr_auto] gap-4 items-center px-5 py-4 hover:bg-gray-50/60 transition-colors"
              >
                <p className="text-sm font-medium text-gray-800 truncate">
                  {u.name}
                  {isSelf && (
                    <span className="ml-2 text-xs text-blue-500 font-normal">
                      (you)
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-500 truncate">{u.email}</p>
                <select
                  value={u.role}
                  disabled={isSelf || updatingId === u.id}
                  onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  className="text-xs border border-gray-200 rounded-md px-2 py-1.5 text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Users;
