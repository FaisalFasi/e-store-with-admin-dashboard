import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { getUserData } from "@/utils/getUserData";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = getUserData();
  const location = useLocation();

  if (!user) {
    // Redirect to login if the user is not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect to a different page if the user doesn't have the required role
    // return <Navigate to="/" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
