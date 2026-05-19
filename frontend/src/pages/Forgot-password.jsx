import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/reset-password-request",
        { email }
      );

      if (res.data.success) {
        setEmailSent(true);
        toast.success("Password reset link sent! Check your email.");
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.message || "Failed to send reset link");
      } else {
        toast.error("Server is not responding. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  // Success state after email is sent
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200 px-4">
        <div className="max-w-md w-full bg-base-100 p-10 rounded-[2.5rem] shadow-2xl border border-base-300 relative overflow-hidden">

          <div className="absolute -top-10 -right-10 w-32 h-32 bg-success/10 rounded-full blur-3xl"></div>

          <div className="text-center mb-8">
            <div className="avatar mb-4">
              <div className="w-24 h-24 rounded-full ring ring-success ring-offset-base-100 ring-offset-2 shadow-inner bg-base-200">
                <div className="flex items-center justify-center w-full h-full text-4xl">
                  ✉️
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
              Check Your Email
            </h1>
            <p className="text-sm opacity-50 font-medium">
              We sent a password reset link to<br />
              <span className="font-bold text-primary">{email}</span>
            </p>
          </div>

          <div className="space-y-5">
            <div className="bg-base-200 rounded-2xl p-4 text-center">
              <p className="text-sm opacity-70">
                Didn't receive the email? Check your spam folder or
                <button
                  onClick={() => setEmailSent(false)}
                  className="text-primary font-bold hover:underline ml-1"
                >
                  try again
                </button>
              </p>
            </div>

            <button
              onClick={handleBackToLogin}
              className="btn btn-primary btn-block rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              Back to Sign In
            </button>
          </div>

          <div className="mt-8 text-center text-sm">
            <span className="opacity-50">Remember your password? </span>
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
                🔑
              </div>
            </div>
          </div>

          <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">
            Forgot Password?
          </h1>
          <p className="text-sm opacity-50 font-medium">
            No worries, we'll send you reset instructions
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-control">
            <label className="label-text font-bold text-xs uppercase mb-2 ml-1">
              Email Address
            </label>
            <input
              type="email"
              className="input input-bordered w-full rounded-2xl focus:input-primary transition-all"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] active:scale-95 transition-all mt-4"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <span className="opacity-50">Remember your password? </span>
          <Link to="/login" className="font-bold text-primary hover:underline">
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;