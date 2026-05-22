import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ResetPassword = () => {
  const { token } = useParams(); // Extract token from URL
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  // Validate token on mount (optional - you can call your backend to verify)
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Validate password length
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(
        `/api/v1/users/reset-password/${token}`,
        { password, confirmPassword }
      );

      if (res.data.success) {
        setIsSuccess(true);
        toast.success("Password reset successful! You can now login with your new password.");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Failed to reset password");
      } else {
        toast.error("Server is not responding. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoToLogin = () => {
    navigate("/login");
  };

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="max-w-md w-full bg-base-100 p-10 rounded-[2.5rem] shadow-2xl border border-base-300 relative overflow-hidden">

          <div className="absolute -top-10 -right-10 w-32 h-32 bg-error/10 rounded-full blur-3xl"></div>

          <div className="text-center mb-8">
            <div className="avatar mb-4">
              <div className="w-24 h-24 rounded-full ring ring-error ring-offset-base-100 ring-offset-2 shadow-inner bg-base-200">
                <div className="flex items-center justify-center w-full h-full text-4xl">
                  ❌
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Invalid Link
            </h1>
            <p className="text-sm opacity-50 font-medium">
              This password reset link is invalid or has expired
            </p>
          </div>

          <button
            onClick={() => navigate("/forgot-password")}
            className="btn btn-primary btn-block rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Request New Link
          </button>

          <div className="mt-8 text-center text-sm">
            <Link to="/login" className="font-bold text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state after password reset
  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="max-w-md w-full bg-base-100 p-10 rounded-[2.5rem] shadow-2xl border border-base-300 relative overflow-hidden">

          <div className="absolute -top-10 -right-10 w-32 h-32 bg-success/10 rounded-full blur-3xl"></div>

          <div className="text-center mb-8">
            <div className="avatar mb-4">
              <div className="w-24 h-24 rounded-full ring ring-success ring-offset-base-100 ring-offset-2 shadow-inner bg-base-200">
                <div className="flex items-center justify-center w-full h-full text-4xl">
                  ✅
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Password Reset!
            </h1>
            <p className="text-sm opacity-50 font-medium">
              Your password has been successfully reset
            </p>
          </div>

          <button
            onClick={handleGoToLogin}
            className="btn btn-primary btn-block rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
          >
            Sign In Now
          </button>

          <div className="mt-8 text-center text-sm">
            <span className="opacity-50">Remember your new password? </span>
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Initial form state
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
      <div className="max-w-md w-full bg-base-100 p-10 rounded-[2.5rem] shadow-2xl border border-base-300 relative overflow-hidden">

        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="text-center mb-8">
          <div className="avatar mb-4">
            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-inner bg-base-200">
              <div className="flex items-center justify-center w-full h-full text-4xl">
                🔐
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            Set New Password
          </h1>
          <p className="text-sm opacity-50 font-medium">
            Create a strong password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* New Password */}
          <div className="form-control">
            <label className="label-text font-bold text-xs uppercase mb-2 ml-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="input input-bordered w-full rounded-2xl focus:input-primary pr-12 transition-all"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          {/* Confirm Password */}
          <div className="form-control">
            <label className="label-text font-bold text-xs uppercase mb-2 ml-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="input input-bordered w-full rounded-2xl focus:input-primary pr-12 transition-all"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-40 hover:opacity-100"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? "👁️" : "🙈"}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <label className="label">
                <span className="label-text-alt text-error">Passwords do not match</span>
              </label>
            )}
          </div>

          {/* Password Requirements */}
          <div className="bg-base-200 rounded-2xl p-4">
            <p className="text-xs font-bold uppercase mb-2 opacity-50">Password must contain:</p>
            <ul className="text-sm space-y-1">
              <li className={password.length >= 6 ? "text-success" : "opacity-50"}>
                • At least 6 characters
              </li>
            </ul>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all mt-4"
            disabled={isLoading || password !== confirmPassword}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="opacity-50">Remember your password? </span>
          <Link to="/login" className="font-bold text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;