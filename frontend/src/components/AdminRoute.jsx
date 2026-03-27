import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth";

const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (!isAdmin) {
    return <Navigate to="/" />;
  }
  return children;
};

export default AdminRoute;
