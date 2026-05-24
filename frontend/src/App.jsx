import "./App.css";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetai";
import CreateProduct from "./pages/CreateProduct";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import UpdateProfile from "./pages/UpdateProfile";
import ForgotPassword from "./pages/Forgot-password";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashbourd";
import ViewAllOrders from "./pages/admin/ViewAllOrders";
import ViewAllProduct from "./pages/admin/ViewAllProduct";
import UserAdmin from "./pages/admin/UserAdmin";
import AdminSetting from "./pages/admin/AdminSetting";
import { useStore } from "./context/StoreContext";

const adminPaths = ["/admin", "/viewAllOrders", "/admin/viewAllProduct", "/admin/users", "/admin/settings", "/profile", "/update-profile"];

const AppContent = () => {
  const location = useLocation();
  const isAdminPage = adminPaths.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));
  const { store, loading } = useStore();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const isAdmin = token && role === "admin";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (store.maintenanceMode && !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 px-4">
        <div className="text-center max-w-md">
          <div className="text-8xl mb-6">🔧</div>
          <h1 className="text-4xl font-black mb-4">{store.storeName}</h1>
          <p className="text-xl opacity-60 mb-2">We'll be back soon!</p>
          <p className="opacity-40">Our store is currently under maintenance. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      {!isAdminPage && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/product-detail/:id" element={<ProductDetail />} />
        <Route path="/create-product" element={<CreateProduct />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/profile" element={isAdmin ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/update-profile" element={isAdmin ? <UpdateProfile /> : <Navigate to="/login" />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        <Route path="/admin" element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path="/viewAllOrders" element={isAdmin ? <ViewAllOrders /> : <Navigate to="/login" />} />
        <Route path="/ViewAllOrders" element={<Navigate to="/viewAllOrders" replace />} />
        <Route path="/viewAllorders" element={<Navigate to="/viewAllOrders" replace />} />
        <Route path="/admin/viewAllProduct" element={isAdmin ? <ViewAllProduct /> : <Navigate to="/login" />} />
        <Route path="/admin/users" element={isAdmin ? <UserAdmin /> : <Navigate to="/login" />} />
        <Route path="/admin/settings" element={isAdmin ? <AdminSetting /> : <Navigate to="/login" />} />
      </Routes>
      {!isAdminPage && <Footer />}
    </>
  );
};

const App = () => <AppContent />;
export default App;
