import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api from "../lib/axios";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  // states: 'loading', 'authenticated', 'unauthenticated', 'error'
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await api.get("/auth/me");
        setStatus("authenticated");
      } catch (error) {
        if (error.response?.status === 401) {
          setStatus("unauthenticated");
        } else {
          setStatus("error");
        }
      }
    };
    checkAuth();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-xl font-semibold text-gray-600">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Server Unavailable</h2>
        <p className="text-gray-600">Please check your internet or backend server.</p>
        <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          Retry
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;