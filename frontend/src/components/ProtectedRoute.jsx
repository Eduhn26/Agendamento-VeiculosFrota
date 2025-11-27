import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading"; 

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();

  
  if (loading) {
     
      return (
          <div className="flex justify-center items-center min-h-screen bg-gray-100">
              <Loading />
          </div>
      );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;