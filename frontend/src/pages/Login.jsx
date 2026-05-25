import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [dbAvatar, setDbAvatar] = useState(""); // Stores the real image from MongoDB
  const [avatarError, setAvatarError] = useState(false);
  const debounceRef = useRef(null);
  const navigate = useNavigate();

  // Fetch avatar from DB by email (debounced)
  const fetchUserAvatar = async (email) => {
    if (!email) {
      setDbAvatar("");
      return;
    }
    try {
      const { data } = await axios.get(
        `/api/v1/users/get-photo/${encodeURIComponent(email)}`,
      );
      if (data.success && data.url) {
        setDbAvatar(data.url);
        setAvatarError(false);
      } else {
        setDbAvatar("");
      }
    } catch {
      setDbAvatar("");
    }
  };

  // Debounced auto-fetch when email changes (so it updates as you type)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchUserAvatar(formData.email);
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [formData.email]);

  // Show DB image if found, otherwise Dicebear
  const avatarUrl =
    dbAvatar && !avatarError
      ? dbAvatar
      : `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.email || "default"}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        "/api/v1/users/login-user",
        formData,
      );

      console.log("Success:", res.data);
      const token = res.data.token;
      const user = res.data.user;

      Cookies.set("token", token, { expires: 7, secure: false });
      localStorage.setItem("token", token);

      // Save user role and avatar to localStorage for Navbar/Profile use
      if (user.role) {
        localStorage.setItem("userRole", user.role);
      }
      if (user.id) {
        localStorage.setItem("userId", user.id);
      }
      if (user.profile?.url && user.profile.url !== "url") {
        localStorage.setItem("userAvatar", user.profile.url);
      } else {
        localStorage.removeItem("userAvatar");
      }

      if (res.data.success) {
        toast.success(`Welcome back, ${user.name}!`);

        // ===========================================
        // ROLE-BASED NAVIGATION
        // ===========================================
        if (user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/");
        }
        // ===========================================
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Login failed");
      } else {
        toast.error("Server is not responding.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="max-w-md w-full bg-base-100 p-10 rounded-[2.5rem] shadow-2xl border border-base-300 relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-8">
          <div className="avatar mb-4">
            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-inner bg-base-200">
              <img
                src={avatarUrl}
                alt="User Avatar"
                className="object-cover"
                onError={() => setAvatarError(true)}
              />
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            Welcome Back
          </h1>
          <p className="text-sm opacity-50 font-medium">
            {formData.email
              ? `Signing in as ${formData.email}`
              : "Log in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <label className="label-text font-bold text-xs uppercase mb-2 ml-1">
              Email
            </label>
            <input
              type="email"
              className="input input-bordered w-full rounded-2xl focus:input-primary transition-all"
              placeholder="email@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="form-control">
            <div className="flex justify-between items-center mb-2 ml-1">
              <label className="label-text font-bold text-xs uppercase">
                Password
              </label>
              <Link
                to="/forgot-password"
                size="xs"
                className="text-[10px] font-bold text-primary uppercase hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full rounded-2xl focus:input-primary pr-12 transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-40 hover:opacity-100"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "👁️" : "🙈"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all mt-4"
          >
            Sign In
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="opacity-50">New here? </span>
          <Link
            to="/register"
            className="font-bold text-primary hover:underline"
          >
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
