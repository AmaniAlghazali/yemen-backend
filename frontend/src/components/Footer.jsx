import { Link } from "react-router-dom";
import { useStore } from "../context/StoreContext";

const Footer = () => {
  const { store } = useStore();

  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-10 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="text-center sm:text-left">
            <h3 className="text-xl md:text-2xl font-black tracking-tighter mb-4">{store.storeName}</h3>
            <p className="text-sm opacity-60 leading-relaxed">
              Your trusted store for quality products. Fast delivery across Saudi Arabia.
            </p>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 opacity-70">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link to="/" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Home</Link></li>
              <li><Link to="/about" className="text-sm opacity-60 hover:opacity-100 transition-opacity">About Us</Link></li>
              <li><Link to="/contact" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Contact</Link></li>
              <li><Link to="/create-product" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Products</Link></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 opacity-70">Customer Service</h4>
            <ul className="space-y-3">
              <li><Link to="/contact" className="text-sm opacity-60 hover:opacity-100 transition-opacity">Help Center</Link></li>
              <li><span className="text-sm opacity-60">Returns Policy</span></li>
              <li><span className="text-sm opacity-60">Shipping Info</span></li>
            </ul>
          </div>

          <div className="text-center sm:text-left">
            <h4 className="font-bold text-sm uppercase tracking-widest mb-4 opacity-70">Contact</h4>
            <ul className="space-y-3">
              <li className="text-sm opacity-60">Riyadh, Saudi Arabia</li>
              <li className="text-sm opacity-60">+966 50 000 0000</li>
              <li className="text-sm opacity-60">support@{store.storeName?.toLowerCase?.() || "store"}.com</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-base-300 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-xs opacity-40">
            &copy; {new Date().getFullYear()} {store.storeName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;