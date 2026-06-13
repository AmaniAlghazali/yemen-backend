import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const API_URL = "/api/v1";

const navItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
  },
  {
    path: "/admin/viewAllProduct",
    label: "Products",
    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  },
  {
    path: "/viewAllOrders",
    label: "Orders",
    icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
  },
  {
    path: "/admin/users",
    label: "Users",
    icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
  },
  {
    path: "/admin/settings",
    label: "Settings",
    icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
  },
];

const AdminLayout = ({ children, title = "Dashboard" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [adminLoading, setAdminLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const res = await axios.get(`${API_URL}/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          setAdmin(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
          const url = res.data.user.profileUrl;
          if (url && url !== "url") {
            localStorage.setItem("userAvatar", url);
          }
        }
      } catch {
        const cached = localStorage.getItem("user");
        if (cached) {
          try {
            setAdmin(JSON.parse(cached));
          } catch {
            /* empty */
          }
        }
      } finally {
        setAdminLoading(false);
      }
    };
    fetchAdminProfile();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.get(`${API_URL}/users/logout`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      /* empty */
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const adminInitial = admin?.name?.charAt(0)?.toUpperCase() || "A";
  const avatarUrl = admin?.profileUrl || localStorage.getItem("userAvatar");

  return (
    <div className="min-h-screen bg-base-200 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-base-100 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } flex flex-col`}
      >
        <div className="bg-linear-to-br from-primary to-primary/80 text-primary-content p-5">
          <div className="flex items-center gap-3 mb-3">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Admin"
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold border-2 border-white/30">
                {adminInitial}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-bold text-sm truncate">
                {admin?.name || "Admin"}
              </h3>
              <p className="text-xs opacity-80 truncate">
                {admin?.role === "admin" ? "Administrator" : "User"}
              </p>
            </div>
          </div>
          {admin?.email && (
            <p className="text-xs opacity-70 truncate">{admin.email}</p>
          )}
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive(item.path)
                  ? "bg-primary text-primary-content shadow-md"
                  : "text-base-content/70 hover:bg-base-200 hover:text-base-content"
              }`}
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d={item.icon}
                />
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-base-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-error hover:bg-error/10 w-full transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-base-100/80 backdrop-blur-sm border-b border-base-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden btn btn-square btn-ghost btn-sm"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary hidden sm:inline-block">
                Admin
              </span>
              <span className="text-base-content/30 hidden sm:inline">/</span>
              <h1 className="text-base md:text-lg font-bold">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="btn btn-ghost btn-sm rounded-xl gap-1.5 text-base-content/60 hover:text-base-content hidden sm:flex"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Storefront
            </Link>
            <div className="dropdown dropdown-end">
              <label
                tabIndex={0}
                className="btn btn-ghost btn-circle avatar btn-sm"
              >
                {avatarUrl ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden">
                    <img
                      src={avatarUrl}
                      alt="Admin"
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-content flex items-center justify-center text-sm font-bold">
                    {adminInitial}
                  </div>
                )}
              </label>
              <ul
                tabIndex={0}
                className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-xl w-48 border border-base-200 z-50"
              >
                <li className="menu-title text-xs opacity-50 px-3">
                  <span>{admin?.name || "Admin"}</span>
                </li>
                <li>
                  <Link to="/profile" className="py-2">
                    My Profile
                  </Link>
                </li>
                <li>
                  <Link to="/" className="py-2">
                    View Store
                  </Link>
                </li>
                <div className="divider my-1" />
                <li>
                  <button
                    onClick={handleLogout}
                    className="text-error py-2 font-medium"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
