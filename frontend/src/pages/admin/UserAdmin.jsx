import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8000/api/v1";

const UserAdmin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [userFilter, setUserFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals visibility states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Focused working user reference
  const [selectedUser, setSelectedUser] = useState(null);

  // Form fields for adding a user
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("user");

  // Form fields for editing a user
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("user");

  // Authentication Headers Helpers
  const getToken = useCallback(() => localStorage.getItem("token"), []);

  const getAuthHeader = useCallback(
    () => ({ headers: { Authorization: `Bearer ${getToken()}` } }),
    [getToken],
  );

  // FETCH ALL USERS FROM THE BACKEND
  const fetchUsers = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/users/all-users`,
        getAuthHeader(),
      );
      if (res.data.success) {
        setUsers(res.data.users || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Could not load user data from the server.");
    }
  }, [getAuthHeader]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await fetchUsers();
      setIsLoading(false);
    };
    loadData();
  }, [fetchUsers]);

  // Date Formatter Helper
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // ============================================
  // USER CRUD OPERATIONS OPERATIONS HANDLERS
  // ============================================

  // 1. CREATE HANDLER
  const handleRegisterUser = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/users/register-user`,
        {
          name: newName,
          email: newEmail,
          password: newPassword,
          role: newRole,
        },
        getAuthHeader(),
      );

      if (res.data.success) {
        toast.success("New user registered successfully!");
        setNewName("");
        setNewEmail("");
        setNewPassword("");
        setNewRole("user");
        setIsAddModalOpen(false);
        await fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to register new account",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. READ VIEW MODAL OVERLAY TRIGGER
  const handleOpenViewModal = (user) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // 3. EDIT UPDATE TRIGGER
  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditRole(user.role || "user");
    setIsEditModalOpen(true);
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsActionLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/users/update-user/${selectedUser._id}`,
        { name: editName, email: editEmail, role: editRole },
        getAuthHeader(),
      );

      if (res.data.success) {
        toast.success("User profile updated safely!");
        setIsEditModalOpen(false);
        await fetchUsers();
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Failed to update user metrics",
      );
    } finally {
      setIsActionLoading(false);
    }
  };

  // 4. TERMINATE DELETE ACCOUNT HANDLER
  const handleDeleteUser = async (userId) => {
    if (
      window.confirm(
        "Are you entirely sure you want to delete this user account?",
      )
    ) {
      try {
        const res = await axios.delete(
          `${API_URL}/users/delete-user/${userId}`,
          getAuthHeader(),
        );
        if (res.data.success) {
          toast.success("User account deleted.");
          await fetchUsers();
        }
      } catch (error) {
        console.error(error);
        toast.error(
          error.response?.data?.message ||
            "Failed to complete account deletion.",
        );
      }
    }
  };

  // ============================================
  // CLIENT FILTER REGEX LOGIC MATCHES
  // ============================================
  const filteredUsers = users.filter((user) => {
    if (userFilter === "admin" && user.role !== "admin") return false;
    if (userFilter === "user" && user.role !== "user") return false;

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      return (
        user.name?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query) ||
        user.role?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const countAdmins = users.filter((u) => u.role === "admin").length;
  const countStandardUsers = users.filter((u) => u.role === "user").length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 grid grid-cols-1 lg:grid-cols-[260px_1fr]">
      {/* DESKTOP PANEL ASIDE SIDEBAR */}
      <aside className="hidden lg:flex flex-col bg-base-100 border-r border-base-300 w-full min-h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 bg-base-100 border-b border-base-300 gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
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
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
              />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-base-content tracking-tight">
            Products Hub
          </h2>
        </div>

        <nav className="menu p-4 space-y-1.5 flex-1">
          <li className="menu-title text-xs font-semibold uppercase tracking-wider opacity-40 px-2 mb-1">
            Views
          </li>
          <li>
            <Link
              to="/admin/viewAllProduct"
              className="w-full font-medium rounded-xl hover:bg-base-200"
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              All Products
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              className="w-full font-medium rounded-xl hover:bg-base-200"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Dashboard
            </Link>
          </li>

          <li className="menu-title text-xs font-semibold uppercase tracking-wider opacity-40 px-2 mt-4 mb-1">
            Management
          </li>
          <li>
            <Link
              to="/ViewAllOrders"
              className="w-full font-medium rounded-xl hover:bg-base-200"
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
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              Orders List
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className="w-full active bg-primary text-primary-content font-semibold shadow-sm rounded-xl"
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              Users & Customers
            </Link>
          </li>
          <li>
            <Link
              to="/admin/settings"
              className="w-full font-medium rounded-xl hover:bg-base-200"
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
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
              </svg>
              Store Configuration
            </Link>
          </li>
        </nav>

        <div className="p-4 border-t border-base-300 bg-base-100">
          <button
            onClick={() => navigate("/")}
            className="btn btn-error btn-outline btn-sm w-full gap-2 rounded-xl"
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
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Exit Hub
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE WORKSPACE MAIN PANELS */}
      <div className="flex flex-col w-full min-w-0 overflow-hidden">
        {/* RESPONSIVE TOP NAV OVERLAY CONTAINER */}
        <header className="h-16 bg-base-100 border-b border-base-300 flex items-center justify-between px-4 md:px-6 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            {/* Drawer Drawer Hamburger for Phones */}
            <div className="dropdown lg:hidden">
              <label tabIndex={0} className="btn btn-square btn-ghost btn-sm">
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
              </label>
              <ul
                tabIndex={0}
                className="dropdown-content menu p-3 shadow-xl bg-base-100 rounded-2xl w-60 mt-3 space-y-1.5 border border-base-300 z-50"
              >
                <li className="menu-title font-bold text-primary text-xs px-2">
                  Administration
                </li>
                <li>
                  <Link to="/admin/viewAllProduct">Products Management</Link>
                </li>
                <li>
                  <Link to="/admin">Dashboard</Link>
                </li>
                <li>
                  <Link to="/viewAllorders">Orders List</Link>
                </li>
                <li>
                  <Link
                    to="/admin/users"
                    className="active bg-primary text-primary-content font-medium"
                  >
                    User Accounts
                  </Link>
                </li>
                <li>
                  <Link to="/admin/settings">Settings Configuration</Link>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button
                    onClick={() => navigate("/")}
                    className="text-error font-medium"
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>

            {/* Context breadcrumb titles */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-base-300 text-base-content/70 hidden sm:inline-block">
                Admin
              </span>
              <span className="text-base-content/40 hidden sm:inline-block">
                /
              </span>
              <h1 className="text-base md:text-lg font-bold text-base-content tracking-tight">
                Users Directory
              </h1>
            </div>
          </div>

          <div className="dropdown dropdown-end">
            <label
              tabIndex={0}
              className="btn btn-ghost btn-circle avatar btn-sm md:btn-md"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary text-primary-content flex items-center justify-center shadow-inner">
                <span className="text-sm md:text-base font-bold">A</span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 p-2 shadow-lg menu menu-sm dropdown-content bg-base-100 rounded-xl w-52 border border-base-300 z-50"
            >
              <li>
                <Link to="/" className="py-2">
                  Go to Live Storefront
                </Link>
              </li>
              <div className="divider my-1"></div>
              <li>
                <button
                  onClick={() => navigate("/")}
                  className="text-error py-2 font-medium"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </header>

        {/* WORKSPACE CONTENT RENDER */}
        <main className="p-4 md:p-6 space-y-6 max-w-7xl w-full mx-auto flex-1 overflow-y-auto">
          {/* HEADER TOP CALL TO ACTION SECTION */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-6 rounded-2xl shadow-xs border border-base-300">
            <div>
              <h2 className="text-xl font-bold text-base-content tracking-tight">
                System Users Directory
              </h2>
              <p className="text-xs text-base-content/60 mt-0.5">
                Manage system access privileges and user registration records.
              </p>
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="btn btn-primary rounded-xl gap-2 shadow-md shadow-primary/20 w-full sm:w-auto"
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Add New User
            </button>
          </div>

          {/* SEARCH FIELD BAR AND RADIAL TABS FILTER BOX */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-base-100 p-4 rounded-2xl shadow-xs border border-base-300">
            <div className="w-full sm:w-80 relative">
              <input
                type="text"
                placeholder="Search usernames, emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full rounded-xl pl-10 h-11"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="flex p-1 bg-base-200 rounded-xl gap-1 overflow-x-auto max-w-full self-start sm:self-auto">
              <button
                onClick={() => setUserFilter("all")}
                className={`btn btn-sm h-9 rounded-lg border-none font-semibold px-4 text-xs transition-all ${userFilter === "all" ? "bg-base-100 text-base-content shadow-sm" : "btn-ghost text-base-content/60"}`}
              >
                All ({users.length})
              </button>
              <button
                onClick={() => setUserFilter("admin")}
                className={`btn btn-sm h-9 rounded-lg border-none font-semibold px-4 text-xs transition-all ${userFilter === "admin" ? "bg-error text-error-content shadow-sm" : "btn-ghost text-error"}`}
              >
                Admins ({countAdmins})
              </button>
              <button
                onClick={() => setUserFilter("user")}
                className={`btn btn-sm h-9 rounded-lg border-none font-semibold px-4 text-xs transition-all ${userFilter === "user" ? "bg-success text-success-content shadow-sm" : "btn-ghost text-success"}`}
              >
                Customers ({countStandardUsers})
              </button>
            </div>
          </div>

          {/* DATA MATRIX RESPONSIVE GRID RENDERING */}
          <div className="bg-base-100 rounded-2xl shadow-xs border border-base-300 overflow-hidden">
            {/* Tablet & Desktop Layout Grid Row View */}
            <div className="hidden md:block overflow-x-auto w-full">
              <table className="table w-full">
                <thead className="bg-base-300/40 text-base-content/80">
                  <tr>
                    <th>User Profile Identity</th>
                    <th>Email Endpoint Pointer</th>
                    <th>Privilege Node Level</th>
                    <th>Joined At</th>
                    <th className="text-right">Operations Matrix</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-base-content/50 py-12 font-medium"
                      >
                        No system users found matching this scope.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="hover:bg-base-200/40 transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar placeholder">
                              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary font-bold shadow-inner flex items-center justify-center">
                                <span>
                                  {user.name?.charAt(0).toUpperCase() || "U"}
                                </span>
                              </div>
                            </div>
                            <div className="font-bold text-base-content tracking-tight">
                              {user.name || "Anonymous"}
                            </div>
                          </div>
                        </td>
                        <td className="text-base-content/80 font-medium">
                          {user.email}
                        </td>
                        <td>
                          <span
                            className={`badge font-bold px-2.5 py-1 rounded-md text-xs uppercase tracking-wider ${user.role === "admin" ? "badge-error" : "badge-success"}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="text-sm text-base-content/60 font-medium">
                          {formatDate(user.createdAt)}
                        </td>
                        <td>
                          <div className="flex gap-1.5 justify-end">
                            <button
                              onClick={() => handleOpenViewModal(user)}
                              className="btn btn-sm btn-square btn-ghost text-info rounded-lg"
                              title="View Parameters"
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
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleOpenEditModal(user)}
                              className="btn btn-sm btn-square btn-ghost text-primary rounded-lg"
                              title="Edit Parameters"
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
                                  d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="btn btn-sm btn-square btn-ghost text-error rounded-lg"
                              title="Wipe From DB"
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Viewport Card Block Layout Renders Only on Small Handset Screen displays */}
            <div className="block md:hidden divide-y divide-base-300">
              {filteredUsers.length === 0 ? (
                <div className="text-center text-base-content/50 py-10 px-4 font-medium bg-base-100">
                  No users found matching parameters.
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div
                    key={user._id}
                    className="p-4 space-y-3 bg-base-100 hover:bg-base-200/20 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center text-sm shadow-xs">
                          {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <h4 className="font-bold text-base-content text-sm">
                            {user.name || "Anonymous"}
                          </h4>
                          <span className="text-[11px] opacity-50 block mt-0.5">
                            Joined {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`badge font-bold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase ${user.role === "admin" ? "badge-error" : "badge-success"}`}
                      >
                        {user.role}
                      </span>
                    </div>

                    <p className="text-xs text-base-content/80 break-all font-medium pl-1">
                      {user.email}
                    </p>

                    <div className="flex gap-2 justify-end pt-1 border-t border-base-200/60 mt-1">
                      <button
                        onClick={() => handleOpenViewModal(user)}
                        className="btn btn-xs btn-outline btn-info rounded-md px-3 gap-1 h-7"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(user)}
                        className="btn btn-xs btn-outline btn-primary rounded-md px-3 gap-1 h-7"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="btn btn-xs btn-outline btn-error rounded-md px-3 gap-1 h-7"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ========================================================= */}
      {/* DIALOG POPUP MODAL WRAPPERS (DAISYUI OVERLAY STRUCTURES) */}
      {/* ========================================================= */}

      {/* 1. VIEW MODAL */}
      {isViewModalOpen && selectedUser && (
        <div className="modal modal-open z-50 backdrop-blur-xs">
          <div className="modal-box rounded-2xl border border-base-300 max-w-md p-6 bg-base-100 shadow-2xl relative">
            <button
              onClick={() => setIsViewModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-base-content tracking-tight mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-info"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Account Metadata Info
            </h3>

            <div className="space-y-4 bg-base-200/50 p-4 rounded-xl border border-base-200">
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-40 block">
                  Unique Document ID
                </span>
                <p className="text-xs font-mono break-all text-base-content/90 select-all font-medium mt-0.5">
                  {selectedUser._id}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-40 block">
                  Profile Identity Name
                </span>
                <p className="text-sm font-semibold text-base-content mt-0.5">
                  {selectedUser.name || "No configuration"}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-40 block">
                  Configured Email Address
                </span>
                <p className="text-sm font-semibold text-base-content mt-0.5 break-all">
                  {selectedUser.email}
                </p>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-40 block">
                  Access Security Role
                </span>
                <div className="mt-1">
                  <span
                    className={`badge font-bold uppercase tracking-wider text-[10px] rounded px-2.5 py-0.5 ${selectedUser.role === "admin" ? "badge-error" : "badge-success"}`}
                  >
                    {selectedUser.role}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider font-bold opacity-40 block">
                  Database Registration Stamp
                </span>
                <p className="text-xs font-medium text-base-content/70 mt-0.5">
                  {formatDate(selectedUser.createdAt)}
                </p>
              </div>
            </div>

            <div className="modal-action mt-6">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn btn-neutral rounded-xl btn-sm h-10 px-5"
              >
                Close Viewport
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. EDIT FORM UPDATE MODAL */}
      {isEditModalOpen && selectedUser && (
        <div className="modal modal-open z-50 backdrop-blur-xs">
          <div className="modal-box rounded-2xl border border-base-300 max-w-md p-6 bg-base-100 shadow-2xl">
            <h3 className="text-lg font-bold text-base-content tracking-tight mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M11 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Modify User Access Nodes
            </h3>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">
                    Full Account Name
                  </span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input input-bordered w-full rounded-xl h-10 text-sm focus:outline-primary"
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">
                    Email Endpoint Connection
                  </span>
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input input-bordered w-full rounded-xl h-10 text-sm focus:outline-primary"
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">
                    Security Privilege Level Rank
                  </span>
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="select select-bordered w-full rounded-xl h-10 min-h-0 text-sm focus:outline-primary"
                >
                  <option value="user">Standard Customer (User)</option>
                  <option value="admin">System Administrator (Admin)</option>
                </select>
              </div>

              <div className="modal-action flex gap-2 justify-end pt-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="btn btn-ghost rounded-xl btn-sm h-10 px-4 text-xs font-semibold"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl btn-sm h-10 px-5 text-xs font-semibold gap-2 shadow-sm"
                  disabled={isActionLoading}
                >
                  {isActionLoading && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  Save Fields
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. NEW USER REGISTRATION FORM MODAL */}
      {isAddModalOpen && (
        <div className="modal modal-open z-50 backdrop-blur-xs">
          <div className="modal-box rounded-2xl border border-base-300 max-w-md p-6 bg-base-100 shadow-2xl relative max-h-[90vh] overflow-y-auto m-4">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="btn btn-sm btn-circle btn-ghost absolute right-4 top-4"
            >
              ✕
            </button>

            <h3 className="text-lg font-bold text-base-content tracking-tight mb-4 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              Register New System Account
            </h3>

            <form onSubmit={handleRegisterUser} className="space-y-4">
              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">
                    Full Name
                  </span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="input input-bordered w-full rounded-xl h-10 text-sm focus:outline-primary"
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">
                    Email Address Endpoint
                  </span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="example@domain.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input input-bordered w-full rounded-xl h-10 text-sm focus:outline-primary"
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">
                    Secure Password
                  </span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input input-bordered w-full rounded-xl h-10 text-sm focus:outline-primary"
                />
              </div>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content/70">
                    Access Privilege Node Level
                  </span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="select select-bordered w-full rounded-xl h-10 min-h-0 text-sm focus:outline-primary"
                >
                  <option value="user">Standard Customer (User)</option>
                  <option value="admin">System Administrator (Admin)</option>
                </select>
              </div>

              <div className="modal-action flex gap-2 justify-end pt-2 mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn btn-ghost rounded-xl btn-sm h-10 px-4 text-xs font-semibold"
                  disabled={isActionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary rounded-xl btn-sm h-10 px-5 text-xs font-semibold gap-2 shadow-sm"
                  disabled={isActionLoading}
                >
                  {isActionLoading && (
                    <span className="loading loading-spinner loading-xs"></span>
                  )}
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAdmin;
