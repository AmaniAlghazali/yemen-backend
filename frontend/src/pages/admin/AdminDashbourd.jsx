import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../utils/currency";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "/api/v1";

const AdminDashboard = () => {
  const { store } = useStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalUsers: 0, totalProducts: 0, totalOrders: 0, totalRevenue: 0,
  });
  const [productStats, setProductStats] = useState({ totalProducts: 0, outOfStock: 0, inStock: 0, lowStock: 0 });
  const [orders, setOrders] = useState([]);
  const [orderStats, setOrderStats] = useState({ pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    title: "", description: "", price: "", category: "Clothing", stock: 1,
  });
  const [addImage, setAddImage] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addImageUrl, setAddImageUrl] = useState("");

  const categories = [
    "Electronics", "Clothing", "Food", "Books",
    "Home & Kitchen", "Beauty", "Sports", "Automotive",
    "Toys & Games", "Health", "Pet Supplies", "Office Supplies",
    "Baby & Kids", "Jewelry", "Music", "Arts & Crafts",
    "Garden", "Tools", "Shoes", "Bags & Luggage",
    "Furniture", "Groceries", "Phones & Tablets",
    "Computers & Laptops", "Cameras", "Smart Home", "Stationery",
  ];

  const getAuthHeader = useCallback(() => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  }), []);

  const fetchDashboardStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/users/combine-data`, getAuthHeader());
      if (res.data.success) {
        const data = res.data;
        setDashboardData({
          totalUsers: data.totalUsers || 0,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
        });
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
      const res = await axios.get(`${API_URL}/orders/all-orders`, getAuthHeader());
      if (res.data.success) {
        const ordersData = res.data.orders || [];
        setOrders(ordersData);
        setOrderStats({
          pending: ordersData.filter((o) => o.orderStatus?.toLowerCase() === "pending").length,
          processing: ordersData.filter((o) => o.orderStatus?.toLowerCase() === "processing").length,
          shipped: ordersData.filter((o) => o.orderStatus?.toLowerCase() === "shipped").length,
          delivered: ordersData.filter((o) => o.orderStatus?.toLowerCase() === "delivered").length,
          cancelled: ordersData.filter((o) => o.orderStatus?.toLowerCase() === "cancelled").length,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchDashboardStats(), fetchOrders()]);
      setIsLoading(false);
    };
    load();
  }, [fetchDashboardStats, fetchOrders]);

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      const res = await axios.delete(`${API_URL}/orders/delete-order/${orderId}`, getAuthHeader());
      if (res.data.success) {
        toast.success("Order deleted");
        await Promise.all([fetchOrders(), fetchDashboardStats()]);
      }
    } catch {
      toast.error("Failed to delete order");
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setAddFormData({ title: "", description: "", price: "", category: "Clothing", stock: 1 });
    setAddImage(null);
    setAddImagePreview("");
    setAddImageUrl("");
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: addFormData.title,
        description: addFormData.description,
        price: Number(addFormData.price),
        category: addFormData.category,
        stock: Number(addFormData.stock),
      };
      if (addImageUrl) {
        payload.image = addImageUrl;
      } else if (addImage) {
        payload.image = await fileToBase64(addImage);
      }
      const config = {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      };
      await axios.post(`${API_URL}/products/create-product`, payload, config);
      toast.success("Product added successfully!");
      closeAddModal();
      await Promise.all([fetchDashboardStats(), fetchOrders()]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: "badge-warning", processing: "badge-info", shipped: "badge-primary",
      delivered: "badge-success", cancelled: "badge-error",
    };
    return `badge badge-sm ${map[status?.toLowerCase()] || "badge-ghost"}`;
  };

  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(dashboardData.totalRevenue || 0, store.currency),
      icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      gradient: "from-emerald-500 to-teal-600",
      textColor: "text-emerald-600",
      bgLight: "bg-emerald-50",
      link: null,
    },
    {
      label: "Total Orders",
      value: dashboardData.totalOrders,
      icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
      gradient: "from-orange-500 to-red-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50",
      link: "/viewAllOrders",
    },
    {
      label: "Total Products",
      value: dashboardData.totalProducts,
      icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
      gradient: "from-blue-500 to-indigo-600",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
      link: "/admin/viewAllProduct",
    },
    {
      label: "Total Users",
      value: dashboardData.totalUsers,
      icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z",
      gradient: "from-purple-500 to-pink-600",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50",
      link: "/admin/users",
    },
  ];

  if (isLoading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, idx) => (
            <div
              key={idx}
              onClick={() => card.link && navigate(card.link)}
              className={`relative overflow-hidden rounded-2xl bg-base-100 shadow-sm border border-base-200 p-5 transition-all hover:shadow-md hover:-translate-y-0.5 ${card.link ? "cursor-pointer" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-base-content/60">{card.label}</p>
                  <p className={`text-2xl font-extrabold mt-1 ${card.textColor}`}>
                    {card.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${card.bgLight} flex items-center justify-center`}>
                  <svg className={`w-6 h-6 ${card.textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                  </svg>
                </div>
              </div>
              <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-50`} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-base-100 rounded-2xl shadow-sm border border-base-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base">Order Status Overview</h3>
              <button
                onClick={() => navigate("/viewAllOrders")}
                className="btn btn-ghost btn-xs text-primary"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "Pending", count: orderStats.pending, color: "bg-warning", textColor: "text-warning", bg: "bg-warning/10" },
                { label: "Processing", count: orderStats.processing, color: "bg-info", textColor: "text-info", bg: "bg-info/10" },
                { label: "Shipped", count: orderStats.shipped, color: "bg-primary", textColor: "text-primary", bg: "bg-primary/10" },
                { label: "Delivered", count: orderStats.delivered, color: "bg-success", textColor: "text-success", bg: "bg-success/10" },
                { label: "Cancelled", count: orderStats.cancelled, color: "bg-error", textColor: "text-error", bg: "bg-error/10" },
              ].map((item) => (
                <div key={item.label} className={`${item.bg} rounded-xl p-3 text-center`}>
                  <p className={`text-xl font-extrabold ${item.textColor}`}>{item.count}</p>
                  <p className="text-xs text-base-content/60 mt-0.5">{item.label}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 h-2 bg-base-200 rounded-full overflow-hidden flex">
              {[
                { count: orderStats.pending, color: "bg-warning" },
                { count: orderStats.processing, color: "bg-info" },
                { count: orderStats.shipped, color: "bg-primary" },
                { count: orderStats.delivered, color: "bg-success" },
              ].map((item, idx) => {
                const total = orders.length || 1;
                const pct = (item.count / total) * 100;
                return pct > 0 ? (
                  <div
                    key={idx}
                    className={`${item.color} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                ) : null;
              })}
            </div>
          </div>

          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-5">
            <h3 className="font-bold text-base mb-4">Stock Alerts</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-error/5 rounded-xl border border-error/10">
                <div>
                  <p className="text-sm font-bold text-error">Out of Stock</p>
                  <p className="text-xs text-base-content/50">Items need restock</p>
                </div>
                <span className="text-2xl font-extrabold text-error">{productStats.outOfStock}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-warning/5 rounded-xl border border-warning/10">
                <div>
                  <p className="text-sm font-bold text-warning">Low Stock</p>
                  <p className="text-xs text-base-content/50">Below threshold</p>
                </div>
                <span className="text-2xl font-extrabold text-warning">{productStats.lowStock}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-success/5 rounded-xl border border-success/10">
                <div>
                  <p className="text-sm font-bold text-success">In Stock</p>
                  <p className="text-xs text-base-content/50">Available items</p>
                </div>
                <span className="text-2xl font-extrabold text-success">{productStats.inStock}</span>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin/viewAllProduct")}
              className="btn btn-outline btn-primary btn-sm w-full mt-4 rounded-xl"
            >
              Manage Products
            </button>
          </div>
        </div>

        <div className="bg-base-100 rounded-2xl shadow-sm border border-base-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-base">Recent Orders</h3>
            <button
              onClick={() => navigate("/viewAllOrders")}
              className="btn btn-ghost btn-xs text-primary"
            >
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="text-xs text-base-content/50 uppercase">
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-base-content/40">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-base-200/40">
                      <td className="font-mono text-xs font-medium">
                        #{order.id?.slice(-6)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                            {order.user?.name?.charAt(0) || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{order.user?.name || "N/A"}</p>
                            {order.user?.email && (
                              <p className="text-xs text-base-content/40 hidden md:block">{order.user.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-sm">{order.orderItems?.length || 0}</td>
                      <td className="font-semibold text-sm">{formatPrice(order.totalPrice || 0, store.currency)}</td>
                      <td>
                        <span className={getStatusBadge(order.orderStatus)}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/60">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="btn btn-ghost btn-xs text-error hover:bg-error/10"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Add Product", path: "", icon: "M12 4v16m8-8H4", color: "btn-primary", action: () => setIsAddModalOpen(true) },
            { label: "View Orders", path: "/viewAllOrders", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "btn-warning" },
            { label: "Manage Users", path: "/admin/users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z", color: "btn-info" },
            { label: "Settings", path: "/admin/settings", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "btn-success" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => item.action ? item.action() : navigate(item.path)}
              className={`btn ${item.color} btn-outline rounded-xl gap-2 text-xs sm:text-sm`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} />
              </svg>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-base-300">
            <div className="flex justify-between items-center border-b border-base-300 pb-3 mb-4">
              <h3 className="text-xl font-extrabold">Add New Product</h3>
              <button type="button" onClick={closeAddModal} className="btn btn-sm btn-circle btn-ghost">✕</button>
            </div>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-semibold">Product Title</span></label>
                <input type="text" name="title" value={addFormData.title} onChange={(e) => setAddFormData({ ...addFormData, title: e.target.value })} className="input input-bordered w-full rounded-xl" required />
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-semibold">Description</span></label>
                <textarea name="description" value={addFormData.description} onChange={(e) => setAddFormData({ ...addFormData, description: e.target.value })} className="textarea textarea-bordered w-full rounded-xl" rows="3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold">Price</span></label>
                  <input type="number" name="price" value={addFormData.price} onChange={(e) => setAddFormData({ ...addFormData, price: e.target.value })} className="input input-bordered w-full rounded-xl" required />
                </div>
                <div className="form-control">
                  <label className="label py-1"><span className="label-text font-semibold">Stock</span></label>
                  <input type="number" name="stock" value={addFormData.stock} onChange={(e) => setAddFormData({ ...addFormData, stock: e.target.value })} className="input input-bordered w-full rounded-xl" required />
                </div>
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-semibold">Category</span></label>
                <select name="category" value={addFormData.category} onChange={(e) => setAddFormData({ ...addFormData, category: e.target.value })} className="select select-bordered w-full rounded-xl" required>
                  {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-semibold">Image URL</span></label>
                <input type="url" placeholder="https://example.com/image.jpg" value={addImageUrl} onChange={(e) => { setAddImageUrl(e.target.value); if (e.target.value) { setAddImage(null); setAddImagePreview(e.target.value); } }} className="input input-bordered w-full rounded-xl" />
              </div>
              <div className="divider text-xs text-base-content/30">OR</div>
              <div className="form-control">
                <label className="label py-1"><span className="label-text font-semibold">Upload File</span></label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files[0];
                  setAddImage(file);
                  if (file) { setAddImageUrl(""); setAddImagePreview(URL.createObjectURL(file)); }
                }} className="file-input file-input-bordered w-full rounded-xl" />
              </div>
              {addImagePreview && (
                <div className="relative w-28 h-28 mx-auto border border-base-300 rounded-2xl overflow-hidden shadow-inner bg-base-200">
                  <img src={addImagePreview} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => { setAddImage(null); setAddImagePreview(""); setAddImageUrl(""); }} className="absolute top-1 right-1 bg-error text-error-content w-6 h-6 rounded-full flex items-center justify-center text-xs shadow">✕</button>
                </div>
              )}
              <div className="flex gap-3 pt-4 border-t border-base-300 mt-6">
                <button type="button" onClick={closeAddModal} className="btn btn-ghost flex-1 rounded-xl">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1 rounded-xl shadow-md">
                  {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
