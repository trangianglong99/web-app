import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import MilitaryService from "./pages/MilitaryService";
import MilitaryDetail from "./pages/MilitaryDetail";
import Layout from "./components/Layout";
import Militia from "./pages/Militia";
import Attendance from "./pages/Attendance";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsAuthenticated(!!(token && user));
  };

  useEffect(() => {
    checkAuth();

    // Listen for storage changes (when login/logout happens in another tab)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (for same-tab changes)
    const handleAuthChange = () => {
      checkAuth();
    };

    window.addEventListener("authChange", handleAuthChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show login/register pages
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // If authenticated, show main app with layout
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/military" replace />} />
        <Route path="/military" element={<MilitaryService />} />
        <Route path="/military/detail/:id" element={<MilitaryDetail />} />
        <Route path="/militia" element={<Militia />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/login" element={<Navigate to="/military" replace />} />
        <Route path="*" element={<Navigate to="/military" replace />} />
      </Routes>
    </Layout>
  );
}

export default App;
