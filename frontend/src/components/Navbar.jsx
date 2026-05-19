import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  // 1. Lazy Initializer: Gets the cart data once when the component is created
  // This avoids the ESLint "cascading render" error
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // 2. Function to refresh state whenever the cart changes
  const updateCartData = () => {
    const savedCart = localStorage.getItem("cart");
    setCartItems(savedCart ? JSON.parse(savedCart) : []);
  };

  useEffect(() => {
    // Listen for the "cartUpdated" signal from ProductDetail.jsx
    window.addEventListener("cartUpdated", updateCartData);

    // Clean up listener on unmount
    return () => window.removeEventListener("cartUpdated", updateCartData);
  }, []);

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
            <li><Link to="/create-product">Add Product</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <Link to="/" className="text-2xl md:text-3xl font-black tracking-tighter hover:text-primary transition-colors ms-2">
          DARAZ
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
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
            <div className="indicator">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5" />
              </svg>
              {cartItems.length > 0 && (
                <span className="badge badge-sm badge-primary indicator-item font-bold">
                  {cartItems.length}
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
                  cartItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 py-3 border-b border-base-100 last:border-0">
                      <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold truncate">{item.title}</h4>
                        <p className="text-[10px] opacity-60 font-medium">{item.quantity} x {item.price} SAR</p>
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
                    <span className="text-lg font-black text-primary">{totalPrice} SAR</span>
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
              <img alt="profile" src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-2xl mt-4 w-56 p-3 shadow-2xl border border-base-200 z-1">
            <li className="menu-title text-[10px] font-black uppercase opacity-40 mb-1 tracking-widest">Account</li>
            <li><Link to="/login" className="py-3 font-bold hover:bg-primary/10 rounded-xl">Login 🔑</Link></li>
            <li><Link to="/register" className="py-3 font-bold hover:bg-primary/10 rounded-xl">Register 📝</Link></li>
            <div className="divider my-1"></div>
            <li><Link to="/profile" className="py-3 opacity-70">My Profile</Link></li>
            <li><Link to="/login" className="py-3 text-error font-bold hover:bg-error/10">Logout</Link></li>
          </ul>
        </div>

      </div>
    </div>
  );
};

export default Navbar;