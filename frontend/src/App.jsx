import "./App.css";
import Navbar from "./components/Navbar";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Home from "./pages/Home";
import { Route, Routes } from "react-router-dom";
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
import AdminDashboard from "./pages/admin/AdminDashbourd"; // ADD THIS
import ViewAllOrders from "./pages/admin/ViewAllOrders";
import ViewAllProduct from "./pages/admin/ViewAllProduct";
import UserAdmin from "./pages/admin/UserAdmin";
import AdminSetting from "./pages/admin/AdminSetting";

const App = () => {
  return (
    <>
      <ToastContainer />
      <Navbar />
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
        <Route path="/profile" element={<Profile />} />
        <Route path="/update-profile" element={<UpdateProfile />} />
        <Route path="/password/reset/:token" element={<ResetPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/viewAllorders" element={<ViewAllOrders />} />
        <Route path="/admin/viewAllProduct" element={<ViewAllProduct />} />
        <Route path="/admin/users" element={<UserAdmin />} />
        <Route path="/admin/settings" element={<AdminSetting />} />
      </Routes>
      <Footer />
    </>
  );
};
export default App;
