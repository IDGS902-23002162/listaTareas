import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/authentication";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: "20px", textAlign: "center" }}>Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

