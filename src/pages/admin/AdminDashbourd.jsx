import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const API_URL = "http://localhost:8000/api/v1";

const AdminDashboard = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentAdmin, setCurrentAdmin] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [productStats, setProductStats] = useState({
    totalProducts: 0,
    outOfStock: 0,
    inStock: 0,
    lowStock: 0,
  });

  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  // Orders State
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({
    total: 0,
    pending: 0,
    shipped: 0,
    delivered: 0,
    totalRevenue: 0,
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isOrderFormModalOpen, setIsOrderFormModalOpen] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    userEmail: "",
    products: [{ productId: "", quantity: 1 }],
    shippingInfo: {
      address: "",
      city: "",
      country: "",
      zipCode: "",
      mobileNo: "",
    },
  });

  // Order Import State
  const [isOrderImportModalOpen, setIsOrderImportModalOpen] = useState(false);
  const [orderImportFile, setOrderImportFile] = useState(null);
  const [orderImportPreview, setOrderImportPreview] = useState([]);
  const [isImporting, setIsImporting] = useState(false);

  // Get Auth Token
  const getToken = useCallback(() => localStorage.getItem("token"), []);
  const getAuthHeader = useCallback(
    () => ({ headers: { Authorization: `Bearer ${getToken()}` } }),
    [getToken],
  );

  // ============================================
  // FETCH FUNCTIONS
  // ============================================

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/users/combine-data`,
        getAuthHeader(),
      );

      if (res.data.success) {
        const data = res.data;

        // 1. Update your general dashboard summary card metrics
        setDashboardData({
          totalUsers: data.totalUsers || 0,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
        });

        // 2. Update your internal product stock status counts
        setProductStats({
          totalProducts: data.totalProducts || 0,
          outOfStock: data.outOfStock || 0,
          inStock: data.inStock || 0,
          lowStock: data.lowStock || 0,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [getAuthHeader]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/orders/all-orders`,
        getAuthHeader(),
      );
      if (res.data.success) {
        const ordersData = res.data.orders || [];
        setOrders(ordersData);
        setOrderStats({
          totalAmount: res.data.totalAmount,
          pending: ordersData.filter(
            (o) =>
              o.orderStatus?.toLowerCase() === "processing" ||
              o.orderStatus?.toLowerCase() === "pending",
          ).length,
          shipped: ordersData.filter(
            (o) => o.orderStatus?.toLowerCase() === "shipped",
          ).length,
          delivered: ordersData.filter(
            (o) => o.orderStatus?.toLowerCase() === "delivered",
          ).length,
          totalRevenue: ordersData.reduce(
            (sum, o) => sum + (o.totalPrice || 0),
            0,
          ),
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchDashboardStats(), fetchOrders()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchDashboardStats, fetchOrders]);

  // ============================================
  // ORDER HANDLERS
  // ============================================

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await axios.put(
        `${API_URL}/orders/update-order-status/${orderId}`,
        { status: newStatus },
        getAuthHeader(),
      );
      if (res.data.success) {
        toast.success(`Order status updated to ${newStatus}!`);
        await fetchOrders();
        setIsOrderModalOpen(false);
      }
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        const res = await axios.delete(
          `${API_URL}/orders/delete-order/${orderId}`,
          getAuthHeader(),
        );
        if (res.data.success) {
          toast.success("Order deleted successfully!");
          await fetchOrders();
          await fetchDashboardStats();
        }
      } catch (error) {
        toast.error("Failed to delete order");
      }
    }
  };

  // ============================================
  // LOGOUT
  // ============================================

  const handleLogout = async () => {
    try {
      await axios.get(`${API_URL}/users/logout`, getAuthHeader());
    } catch (error) {
      console.log("Logout error", error);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // ============================================
  // HELPERS
  // ============================================

  const getStatusBadge = (status) => {
    const styles = {
      pending: "badge-warning",
      processing: "badge-info",
      shipped: "badge-primary",
      delivered: "badge-success",
      cancelled: "badge-error",
    };
    return `badge ${styles[status] || "badge-ghost"}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "N/A";
    }
  };

  // Calculate pending count dynamically based on filter
  const getPendingCount = () => {
    return orders.filter((o) => o.orderStatus?.toLowerCase() === "pending")
      .length;
  };

  const getProcessingCount = () => {
    return orders.filter((o) => o.orderStatus?.toLowerCase() === "processing")
      .length;
  };

  const getShippedCount = () => {
    return orders.filter((o) => o.orderStatus?.toLowerCase() === "shipped")
      .length;
  };

  const getDeliveredCount = () => {
    return orders.filter((o) => o.orderStatus?.toLowerCase() === "delivered")
      .length;
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  };

  const filteredOrders =
    orderStatusFilter === "all"
      ? orders
      : orders.filter(
          (order) =>
            order.orderStatus?.toLowerCase() ===
            orderStatusFilter.toLowerCase(),
        );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 flex">
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-base-100 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="h-16 flex items-center justify-center bg-primary text-primary-content">
          <h2 className="text-xl font-bold">Admin Panel</h2>
        </div>
        <nav className="menu p-4 space-y-2">
          <li>
            <button
              onClick={() => {
                setActiveTab("dashboard");
                setSidebarOpen(false);
              }}
              className={`w-full ${activeTab === "dashboard" ? "active bg-primary text-primary-content" : ""}`}
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
              <span>Dashboard</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                navigate("/admin/viewAllProduct");
                setSidebarOpen(false);
              }}
              className={`w-full ${activeTab === "products" ? "active bg-primary text-primary-content" : ""}`}
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
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span>Products</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                setActiveTab("orders");
                setSidebarOpen(false);
                navigate("/viewAllOrders");
              }}
              className={`w-full ${activeTab === "orders" ? "active bg-primary text-primary-content" : ""}`}
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
              <span>Orders</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                navigate("/admin/users");
                setSidebarOpen(false);
              }}
              className={`w-full ${activeTab === "users" ? "active bg-primary text-primary-content" : ""}`}
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
              <span>Users</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => {
                navigate("/admin/settings");
                setSidebarOpen(false);
              }}
              className={`w-full ${activeTab === "settings" ? "active bg-primary text-primary-content" : ""}`}
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
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>Settings</span>
            </button>
          </li>
          <li className="mt-auto pt-4 border-t border-base-300">
            <button onClick={handleLogout} className="w-full text-error">
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
              <span>Logout</span>
            </button>
          </li>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-base-100 shadow-sm flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden btn btn-square btn-ghost"
              aria-label="Toggle sidebar"
            >
              <svg
                className="w-6 h-6"
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
            <h1 className="text-lg md:text-xl font-bold capitalize">
              {activeTab === "dashboard" && "Dashboard Overview"}
              {activeTab === "orders" && "Orders Management"}
              {activeTab === "products" && "Products Management"}
              {activeTab === "users" && "Users Management"}
              {activeTab === "settings" && "Settings"}
            </h1>
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                <span className="text-xl font-bold">
                  {currentAdmin?.name?.charAt(0) || "A"}
                </span>
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 z-1 p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Stats Grid - Fully Responsive */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {/* Products Stat */}
                <div className="stat bg-base-100 rounded-xl md:rounded-2xl shadow">
                  <div className="stat-figure text-primary">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8"
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
                  <div className="stat-title text-xs md:text-sm">Products</div>
                  <Link
                    to="/admin/ViewAllProduct"
                    className="stat-value text-primary text-lg md:text-2xl hover:underline"
                  >
                    {dashboardData.totalProducts}
                  </Link>
                  <div className="stat-desc text-xs md:text-sm">
                    {productStats.lowStock} low stock
                  </div>
                </div>

                {/* Users Stat */}
                <div className="stat bg-base-100 rounded-xl md:rounded-2xl shadow">
                  <div className="stat-figure text-info">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8"
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
                  </div>
                  <div className="stat-title text-xs md:text-sm">Users</div>
                  <div className="stat-value text-info text-lg md:text-2xl">
                    {dashboardData.totalUsers}
                  </div>
                  <div className="stat-desc text-xs md:text-sm">Registered</div>
                </div>

                {/* Orders Stat */}
                <div className="stat bg-base-100 rounded-xl md:rounded-2xl shadow">
                  <div className="stat-figure text-warning">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8"
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
                  </div>
                  <div className="stat-title text-xs md:text-sm">Orders</div>
                  <div className="stat-value text-warning text-lg md:text-2xl">
                    {dashboardData.totalOrders}
                  </div>
                  <div className="stat-desc text-xs md:text-sm">
                    {getPendingCount()} pending
                  </div>
                </div>

                {/* Revenue Stat */}
                <div className="stat bg-base-100 rounded-xl md:rounded-2xl shadow">
                  <div className="stat-figure text-success">
                    <svg
                      className="w-6 h-6 md:w-8 md:h-8"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="stat-title text-xs md:text-sm">Revenue</div>
                  <div className="stat-value text-success text-lg md:text-2xl">
                    ${getTotalRevenue()?.toFixed(2)}
                  </div>
                  <div className="stat-desc text-xs md:text-sm">
                    Total earned
                  </div>
                </div>
              </div>

              {/* Order Status & Quick Actions - Responsive Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Order Status Card */}
                <div className="bg-base-100 rounded-xl md:rounded-2xl shadow p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold mb-4">
                    Order Status
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        setOrderStatusFilter("pending");
                      }}
                      className={`p-2 md:p-4 rounded-lg md:rounded-xl text-center transition-all hover:scale-105 ${orderStatusFilter === "pending" ? "bg-warning text-warning-content" : "bg-warning/10"}`}
                    >
                      <div className="text-xl md:text-2xl font-bold">
                        {getPendingCount()}
                      </div>
                      <div className="text-xs md:text-sm opacity-70">
                        Pending
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        setOrderStatusFilter("processing");
                      }}
                      className={`p-2 md:p-4 rounded-lg md:rounded-xl text-center transition-all hover:scale-105 ${orderStatusFilter === "processing" ? "bg-info text-info-content" : "bg-info/10"}`}
                    >
                      <div className="text-xl md:text-2xl font-bold">
                        {getProcessingCount()}
                      </div>
                      <div className="text-xs md:text-sm opacity-70">
                        Processing
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        setOrderStatusFilter("shipped");
                      }}
                      className={`p-2 md:p-4 rounded-lg md:rounded-xl text-center transition-all hover:scale-105 ${orderStatusFilter === "shipped" ? "bg-primary text-primary-content" : "bg-primary/10"}`}
                    >
                      <div className="text-xl md:text-2xl font-bold">
                        {getShippedCount()}
                      </div>
                      <div className="text-xs md:text-sm opacity-70">
                        Shipped
                      </div>
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        setOrderStatusFilter("delivered");
                      }}
                      className={`p-2 md:p-4 rounded-lg md:rounded-xl text-center transition-all hover:scale-105 ${orderStatusFilter === "delivered" ? "bg-success text-success-content" : "bg-success/10"}`}
                    >
                      <div className="text-xl md:text-2xl font-bold">
                        {getDeliveredCount()}
                      </div>
                      <div className="text-xs md:text-sm opacity-70">
                        Delivered
                      </div>
                    </button>
                  </div>
                </div>

                {/* Quick Actions Card */}
                <div className="bg-base-100 rounded-xl md:rounded-2xl shadow p-4 md:p-6">
                  <h3 className="text-base md:text-lg font-bold mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <button
                      onClick={() => navigate("/admin/viewAllProduct")}
                      className="btn btn-primary btn-outline btn-sm md:btn-md"
                    >
                      Manage Products
                    </button>
                    <button
                      onClick={() => {
                        setActiveTab("orders");
                        navigate("/viewAllOrders");
                      }}
                      className="btn btn-warning btn-outline btn-sm md:btn-md"
                    >
                      View Orders
                    </button>
                    <button
                      onClick={() => navigate("/admin/users")}
                      className="btn btn-info btn-outline btn-sm md:btn-md"
                    >
                      Manage Users
                    </button>
                    <button
                      onClick={() => navigate("/admin/settings")}
                      className="btn btn-success btn-outline btn-sm md:btn-md"
                    >
                      Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Orders Table - Responsive */}
              <div className="bg-base-100 rounded-xl md:rounded-2xl shadow p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                  <h3 className="text-base md:text-lg font-bold">
                    Recent Orders
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="btn btn-sm btn-primary"
                  >
                    View All
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="table table-zebra table-sm md:table">
                    <thead>
                      <tr>
                        <th className="text-xs md:text-sm">Order ID</th>
                        <th className="text-xs md:text-sm">Customer</th>
                        <th className="text-xs md:text-sm">Total</th>
                        <th className="text-xs md:text-sm">Status</th>
                        <th className="text-xs md:text-sm">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.slice(0, 5).map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-xs">
                            {order._id?.slice(-6)}
                          </td>
                          <td className="text-xs md:text-sm">
                            {order.user?.name || "N/A"}
                          </td>
                          <td className="text-xs md:text-sm">
                            ${(order.totalPrice || 0).toFixed(2)}
                          </td>
                          <td>
                            <span
                              className={`badge badge-sm ${order.orderStatus === "Delivered" ? "badge-success" : order.orderStatus === "Shipped" ? "badge-info" : "badge-warning"}`}
                            >
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="text-xs md:text-sm">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab - Fully Responsive */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {/* Filter Buttons - Horizontal Scroll on Mobile */}
              <div className="overflow-x-auto pb-2">
                <div className="flex gap-2 min-w-max">
                  <button
                    onClick={() => setOrderStatusFilter("all")}
                    className={`btn btn-sm ${orderStatusFilter === "all" ? "btn-primary" : "btn-ghost"}`}
                  >
                    All ({orders.length})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter("pending")}
                    className={`btn btn-sm ${orderStatusFilter === "pending" ? "btn-warning" : "btn-ghost"}`}
                  >
                    Pending ({getPendingCount()})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter("processing")}
                    className={`btn btn-sm ${orderStatusFilter === "processing" ? "btn-info" : "btn-ghost"}`}
                  >
                    Processing ({getProcessingCount()})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter("shipped")}
                    className={`btn btn-sm ${orderStatusFilter === "shipped" ? "btn-primary" : "btn-ghost"}`}
                  >
                    Shipped ({getShippedCount()})
                  </button>
                  <button
                    onClick={() => setOrderStatusFilter("delivered")}
                    className={`btn btn-sm ${orderStatusFilter === "delivered" ? "btn-success" : "btn-ghost"}`}
                  >
                    Delivered ({getDeliveredCount()})
                  </button>
                </div>
              </div>

              {/* Orders Table - Fully Responsive */}
              <div className="bg-base-100 rounded-xl md:rounded-2xl shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="table table-sm md:table">
                    <thead className="bg-base-200">
                      <tr>
                        <th className="text-xs md:text-sm">Order ID</th>
                        <th className="text-xs md:text-sm">Customer</th>
                        <th className="text-xs md:text-sm">Total</th>
                        <th className="text-xs md:text-sm">Status</th>
                        <th className="text-xs md:text-sm hidden sm:table-cell">
                          Date
                        </th>
                        <th className="text-xs md:text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order) => (
                        <tr key={order._id}>
                          <td className="font-mono text-xs">
                            {order._id?.slice(-6)}
                          </td>
                          <td>
                            <div className="font-bold text-sm">
                              {order.user?.name || "N/A"}
                            </div>
                            <div className="text-xs opacity-50 hidden md:block">
                              {order.user?.email || ""}
                            </div>
                          </td>
                          <td className="font-bold text-sm">
                            ${(order.totalPrice || 0).toFixed(2)}
                          </td>
                          <td>
                            <span className={getStatusBadge(order.orderStatus)}>
                              {order.orderStatus}
                            </span>
                          </td>
                          <td className="text-sm hidden sm:table-cell">
                            {formatDate(order.createdAt)}
                          </td>
                          <td>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="btn btn-xs btn-info"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDeleteOrder(order._id)}
                                className="btn btn-xs btn-error"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Order Details Modal - Fully Responsive */}
      {isOrderModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-base-100 p-4 border-b border-base-300 flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold">Order Details</h3>
              <button
                type="button"
                onClick={() => setIsOrderModalOpen(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <p className="text-sm opacity-50">Order ID</p>
                  <p className="font-mono font-bold text-xs break-all">
                    {selectedOrder._id}
                  </p>
                </div>
                <span className={getStatusBadge(selectedOrder.orderStatus)}>
                  {selectedOrder.orderStatus}
                </span>
              </div>

              {selectedOrder.shippingInfo && (
                <div className="bg-base-200 rounded-xl p-4">
                  <p className="text-sm font-bold mb-2">Shipping Address</p>
                  <p className="text-sm">
                    {selectedOrder.shippingInfo.address}
                  </p>
                  <p className="text-sm">
                    {selectedOrder.shippingInfo.city},{" "}
                    {selectedOrder.shippingInfo.country}{" "}
                    {selectedOrder.shippingInfo.zipCode}
                  </p>
                  <p className="text-sm opacity-50">
                    Phone: {selectedOrder.shippingInfo.mobileNo}
                  </p>
                </div>
              )}

              <div className="bg-base-200 rounded-xl p-4">
                <p className="text-sm font-bold mb-2">Customer</p>
                <p>{selectedOrder.user?.name || "N/A"}</p>
                <p className="text-sm opacity-50">
                  {selectedOrder.user?.email || ""}
                </p>
              </div>

              <div>
                <p className="text-sm font-bold mb-2">Products</p>
                <div className="space-y-2">
                  {selectedOrder.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-3 bg-base-200 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-xs opacity-50">
                          Qty: {item.quantity} × ${item.price?.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-sm">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl">
                <span className="text-lg font-bold">Total</span>
                <span className="text-xl md:text-2xl font-bold text-primary">
                  ${(selectedOrder.totalPrice || 0).toFixed(2)}
                </span>
              </div>

              <div>
                <p className="text-sm font-bold mb-2">Update Status</p>
                <select
                  defaultValue={selectedOrder.orderStatus}
                  onChange={(e) =>
                    handleUpdateOrderStatus(selectedOrder._id, e.target.value)
                  }
                  className="select select-bordered w-full"
                >
                  <option value="Processing">Processing</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Import Modal - Fully Responsive */}
      {isOrderImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-base-100 p-4 border-b border-base-300 flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold">Import Orders</h3>
              <button
                type="button"
                onClick={() => {
                  setIsOrderImportModalOpen(false);
                  setOrderImportFile(null);
                  setOrderImportPreview([]);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-base-200 rounded-xl p-4">
                <h4 className="font-bold mb-2">File Format</h4>
                <code className="text-xs bg-base-300 p-2 rounded block overflow-x-auto">
                  userEmail, address, city, country, zipCode, mobileNo,
                  productIds, quantities
                </code>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-bold">Select File</span>
                </label>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={() => {}}
                  className="file-input file-input-bordered w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOrderImportModalOpen(false);
                    setOrderImportFile(null);
                    setOrderImportPreview([]);
                  }}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!orderImportFile || isImporting}
                  className="btn btn-primary flex-1"
                >
                  {isImporting ? (
                    <>
                      <span className="loading loading-spinner loading-sm mr-2"></span>
                      Importing...
                    </>
                  ) : (
                    "Import Orders"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
