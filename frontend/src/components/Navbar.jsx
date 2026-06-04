import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";

const Navbar = () => {
  const { store } = useStore();
  const [cartItems, setCartItems] = useState([]);
  const [userName, setUserName] = useState(null);

  const navigate = useNavigate();
  const token = Cookies.get("token") || localStorage.getItem("token");
  const role = localStorage.getItem("userRole");
  const isAdmin = token && role === "admin";
  const userAvatar = localStorage.getItem("userAvatar");
  const avatarSrc = userAvatar || "https://api.dicebear.com/7.x/avataaars/svg";

  const [cartCount, setCartCount] = useState(0);

  const fetchCart = async () => {
    const t = Cookies.get("token") || localStorage.getItem("token");
    if (!t) { setCartItems([]); setCartCount(0); return; }
    try {
      const res = await axios.get("/api/v1/cart", {
        headers: { Authorization: `Bearer ${t}` },
      });
      const items = res.data.cart?.items || [];
      setCartItems(items);
      setCartCount(items.length);
    } catch { setCartItems([]); }
  };

  useEffect(() => {
    const handler = () => fetchCart();
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userAvatar");
    navigate("/login");
  };

  useEffect(() => {
    if (token) {
      axios.get("/api/v1/users/profile", {
        headers: { Authorization: `Bearer ${token}` },
      }).then(({ data }) => {
        if (data.success) {
          setUserName(data.user.name);
          const url = data.user.profileUrl;
          if (url && url !== "url") {
            localStorage.setItem("userAvatar", url);
          }
        }
      }).catch(() => {});
    }
  }, [token]);

  // Calculate total price for the dropdown footer
  const totalPrice = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <div className="navbar bg-base-100 shadow-md px-2 md:px-6 sticky top-0 z-50">

      {/* LEFT SECTION: Logo & Mobile Menu */}
      <div className="navbar-start">
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-2xl bg-base-100 rounded-2xl w-52 border border-base-200">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create-product">Products</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter hover:text-primary transition-colors ms-2">
          {store.storeName}
        </Link>
      </div>

      {/* CENTER SECTION: Desktop Navigation */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal gap-2 px-1 font-bold text-sm uppercase tracking-wide">
          <li><Link to="/" className="rounded-lg hover:bg-primary/10">Home</Link></li>
          <li><Link to="/create-product" className="rounded-lg hover:bg-primary/10">Product</Link></li>
          <li><Link to="/about" className="rounded-lg hover:bg-primary/10">About</Link></li>
          <li><Link to="/contact" className="rounded-lg hover:bg-primary/10">Contact</Link></li>
        </ul>
      </div>

      {/* RIGHT SECTION: Actions */}
      <div className="navbar-end gap-2 md:gap-4">

        {/* Shopping Cart Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" onClick={fetchCart} className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5" />
              </svg>
              {cartCount > 0 && (
                <span className="badge badge-sm badge-primary indicator-item font-bold">
                  {cartCount}
                </span>
              )}
            </div>
          </div>

          {/* Cart Dropdown Content */}
          <div tabIndex={0} className="mt-3 z-1 card card-compact dropdown-content w-72 bg-base-100 shadow-2xl border border-base-200 rounded-2xl">
            <div className="card-body">
              <span className="font-black text-lg">{cartItems.length} Items</span>

              <div className="max-h-64 overflow-y-auto mt-2">
                  {cartItems.length > 0 ? (
                    cartItems.map((item) => (
                      <div key={item.product} className="flex items-center gap-3 py-3 border-b border-base-100 last:border-0">
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{item.title}</h4>
                        <p className="text-[10px] opacity-60 font-medium">{item.quantity} x {formatPrice(item.price, store.currency)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm opacity-50">Your cart is empty</p>
                  </div>
                )}
              </div>

              {cartItems.length > 0 && (
                <div className="mt-2 border-t border-base-200 pt-3">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm opacity-60 font-bold uppercase">Subtotal</span>
                    <span className="text-lg font-black text-primary">{formatPrice(totalPrice, store.currency)}</span>
                  </div>
                  <div className="card-actions">
                    <Link to="/cart" className="btn btn-primary btn-block rounded-xl font-bold">
                      View Cart & Checkout
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border-2 border-transparent hover:border-primary transition-all">
            <div className="w-10 rounded-full">
              <img alt="profile" src={avatarSrc} className="object-cover" onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg" }} />
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-2xl mt-4 w-56 p-3 shadow-2xl border border-base-200 z-1">
            {userName && <li className="menu-title text-xs font-black opacity-60 mb-1 tracking-widest">{userName}</li>}
            {!userName && <li className="menu-title text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Account</li>}
            {token ? (
              <>
                {isAdmin && (
                  <li><Link to="/profile" className="py-3 font-bold hover:bg-primary/10 rounded-xl">My Profile</Link></li>
                )}
                {isAdmin && (
                  <li><Link to="/admin" className="py-3 font-bold hover:bg-primary/10 rounded-xl">System Settings</Link></li>
                )}
                <div className="divider my-1"></div>
                <li><button onClick={handleLogout} className="py-3 text-error font-bold hover:bg-error/10 rounded-xl w-full text-left">Logout</button></li>
              </>
            ) : (
              <>
                <li><Link to="/login" className="py-3 font-bold hover:bg-primary/10 rounded-xl">Login 🔑</Link></li>
                <li><Link to="/register" className="py-3 font-bold hover:bg-primary/10 rounded-xl">Register 📝</Link></li>
              </>
            )}
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Navbar;