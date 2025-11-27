import React from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Vehicles from "./pages/Vehicles";
import RentalRequests from "./pages/RentalRequests";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import History from "./pages/History";


const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: "dashboard",
        element: <UserDashboard />
      },
      {
        path: "history",
        element: <History />
      },


      
      {
        path: "admin",
        element: (
          <ProtectedRoute adminOnly={true}>
            <AdminDashboard />
          </ProtectedRoute>
        )
      },
      {
        path: "admin/vehicles",
        element: (
          <ProtectedRoute adminOnly={true}>
            <Vehicles />
          </ProtectedRoute>
        )
      },
      
      {
        path: "admin/requests",
        element: (
          <ProtectedRoute adminOnly={true}>
            <RentalRequests />
          </ProtectedRoute>
        )
      }
    ]
  },
  {
    path: "/login",
    element: <Login />
  }
]);

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;