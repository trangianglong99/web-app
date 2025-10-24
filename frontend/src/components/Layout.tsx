import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [user, setUser] = useState<{
    fullName: string;
    email: string;
    role: string;
  } | null>(null);

  const loadUser = () => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("user");
        setUser(null);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Only load user if not on login/register pages
    if (location.pathname !== "/login" && location.pathname !== "/register") {
      loadUser();

      // Listen for auth changes
      const handleAuthChange = () => {
        loadUser();
      };

      window.addEventListener("authChange", handleAuthChange);

      return () => {
        window.removeEventListener("authChange", handleAuthChange);
      };
    }
  }, [location.pathname]);

  // Don't show layout for login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return <>{children}</>;
  }

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);

    // Dispatch custom event to notify App.tsx
    window.dispatchEvent(new Event("authChange"));

    window.location.href = "/login";
  };

  const navItems = [
    { path: "/military", label: "Nghĩa vụ QS" },
    { path: "/militia", label: "Dân quân TT" },
    { path: "/attendance", label: "Dự bị động viên" },
    { path: "/profile-form", label: "Điền hồ sơ" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Quản lý hồ sơ
              </Link>
            </div>

            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {item.label}
                </Link>
              ))}

              {user && (
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    Xin chào, <strong>{user.fullName}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © 2025 Management Profile designer by Tran Giang Long
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
