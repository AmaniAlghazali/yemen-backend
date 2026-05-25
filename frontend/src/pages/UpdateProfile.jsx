import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [avatarPreview, setAvatarPreview] = useState(
    "https://api.dicebear.com/7.x/avataaars/svg",
  );
  const [avatar, setAvatar] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
  });

  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [validationErrors, setValidationErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const getToken = () => Cookies.get("token") || localStorage.getItem("token");
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = getToken();
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const { data } = await axios.get("/api/v1/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (data.success) {
          setProfileData({ name: data.user.name, email: data.user.email });
          if (data.user.profileUrl && data.user.profileUrl !== "url") {
            setAvatarPreview(data.user.profileUrl);
          }
        }
      } catch {
        navigate("/login");
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const validatePassword = (password) => {
    if (password.length < 8) return "At least 8 characters";
    if (!/[A-Z]/.test(password)) return "One uppercase letter required";
    if (!/[a-z]/.test(password)) return "One lowercase letter required";
    if (!/[0-9]/.test(password)) return "One number required";
    return "";
  };

  const handleSecurityInput = (field, value) => {
    setSecurityData({ ...securityData, [field]: value });
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }
    if (field === "newPassword" && value) {
      const error = validatePassword(value);
      setValidationErrors((prev) => ({ ...prev, newPassword: error }));
      if (securityData.confirmPassword && value !== securityData.confirmPassword) {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else if (securityData.confirmPassword) {
        setValidationErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
    if (field === "confirmPassword" && securityData.newPassword) {
      if (value !== securityData.newPassword) {
        setValidationErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match",
        }));
      } else {
        setValidationErrors((prev) => ({ ...prev, confirmPassword: "" }));
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!securityData.oldPassword) {
      toast.error("Enter your current password to save changes");
      return;
    }
    setLoading(true);
    try {
      const updateData = {
        name: profileData.name,
        email: profileData.email,
        oldPassword: securityData.oldPassword,
      };
      if (avatar) updateData.avatar = avatar;

      const { data } = await axios.put(
        "/api/v1/users/update-profile",
        updateData,
        getAuthHeader(),
      );
      if (data.success) {
        toast.success("Profile updated successfully!");
        setSecurityData((prev) => ({ ...prev, oldPassword: "" }));
        setAvatar("");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setValidationErrors({ oldPassword: "", newPassword: "", confirmPassword: "" });

    if (!securityData.oldPassword) {
      setValidationErrors((prev) => ({ ...prev, oldPassword: "Current password is required" }));
      return;
    }
    if (!securityData.newPassword) {
      setValidationErrors((prev) => ({ ...prev, newPassword: "New password is required" }));
      return;
    }
    const pwdError = validatePassword(securityData.newPassword);
    if (pwdError) {
      setValidationErrors((prev) => ({ ...prev, newPassword: pwdError }));
      return;
    }
    if (!securityData.confirmPassword) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: "Please confirm your new password" }));
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      setValidationErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }
    if (securityData.oldPassword === securityData.newPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "/api/v1/users/update-password",
        {
          oldPassword: securityData.oldPassword,
          newPassword: securityData.newPassword,
          confirmNewPassword: securityData.confirmPassword,
        },
        getAuthHeader(),
      );
      toast.success("Password changed successfully!");
      setSecurityData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const PasswordChecklist = ({ password }) => (
    <div className="bg-base-200/50 p-4 rounded-xl text-xs space-y-2">
      <p className="font-semibold text-base-content/60 uppercase tracking-wider text-[11px]">
        Password Requirements
      </p>
      <div className="space-y-1.5">
        {[
          { label: "At least 8 characters", test: password.length >= 8 },
          { label: "One uppercase letter", test: /[A-Z]/.test(password) },
          { label: "One lowercase letter", test: /[a-z]/.test(password) },
          { label: "One number", test: /[0-9]/.test(password) },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all ${
                item.test
                  ? "bg-success text-success-content scale-100"
                  : "bg-base-300 scale-90"
              }`}
            >
              {item.test && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span
              className={`transition-colors ${
                item.test ? "text-success font-medium" : "text-base-content/40"
              }`}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "security", label: "Security", icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Gradient Header */}
      <div className="relative h-36 md:h-44 bg-gradient-to-br from-primary/80 via-primary to-secondary/70 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-16 -right-16 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -left-12 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-20 pb-10 relative z-10">
        {/* Header Content */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white drop-shadow-sm">
              Settings
            </h1>
            <p className="text-sm text-white/70 font-medium mt-1 drop-shadow-sm">
              Manage your account and security
            </p>
          </div>
          <Link
            to="/profile"
            className="btn btn-ghost rounded-xl gap-2 text-white/80 hover:text-white hover:bg-white/10 border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>

        {/* Tabs */}
        <div className="bg-base-100 rounded-2xl shadow-xl border border-base-200 overflow-hidden">
          <div className="border-b border-base-200">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 md:px-6 h-12 text-sm font-semibold transition-all relative ${
                    activeTab === tab.id
                      ? "text-primary"
                      : "text-base-content/50 hover:text-base-content/80"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={tab.icon} />
                  </svg>
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 md:p-8">
            {activeTab === "profile" && (
              <form onSubmit={handleUpdateProfile} className="max-w-2xl">
                {/* Avatar */}
                <div className="flex flex-col sm:flex-row items-center gap-5 mb-8 pb-8 border-b border-base-200">
                  <div className="relative group">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-2 ring-primary/20 ring-offset-2 overflow-hidden shadow-md">
                      <img
                        src={avatarPreview}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "https://api.dicebear.com/7.x/avataaars/svg";
                        }}
                      />
                    </div>
                    <label className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-0.5">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-[10px] text-white font-medium">Change</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg font-bold">{profileData.name}</h2>
                    <p className="text-sm opacity-50">{profileData.email}</p>
                    <p className="text-[11px] opacity-40 mt-1 flex items-center justify-center sm:justify-start gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Click avatar to change photo
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="form-control">
                    <label className="label py-1.5">
                      <span className="label-text font-semibold text-xs opacity-60 uppercase tracking-wider">
                        Full Name
                      </span>
                    </label>
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      className="input input-bordered rounded-xl text-sm h-11 focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1.5">
                      <span className="label-text font-semibold text-xs opacity-60 uppercase tracking-wider">
                        Email Address
                      </span>
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      className="input input-bordered rounded-xl text-sm h-11 focus:outline-none focus:border-primary transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Verify Identity */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-base-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-base-100 px-4 text-xs font-semibold opacity-40 uppercase tracking-wider flex items-center gap-2">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Verify Identity to Save
                    </span>
                  </div>
                </div>

                <div className="form-control max-w-sm mb-6">
                  <label className="label py-1.5">
                    <span className="label-text font-semibold text-xs text-error uppercase tracking-wider">
                      Current Password
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={securityData.oldPassword}
                      onChange={(e) =>
                        setSecurityData({ ...securityData, oldPassword: e.target.value })
                      }
                      className="input input-bordered border-error/20 rounded-xl text-sm h-11 w-full pr-10 focus:border-error transition-all"
                      required
                    />
                    <svg className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-error/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <label className="label py-1">
                    <span className="label-text-alt text-[11px] opacity-40">
                      Required to confirm changes
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary rounded-xl px-8 h-11 w-full sm:w-auto shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={handleUpdatePassword} className="max-w-2xl">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-base-200">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold">Change Password</h3>
                    <p className="text-xs opacity-40">Choose a strong password you haven't used before</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg">
                  <div className="form-control md:col-span-2">
                    <label className="label py-1.5">
                      <span className="label-text font-semibold text-xs opacity-60 uppercase tracking-wider">
                        Current Password
                      </span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={securityData.oldPassword}
                      onChange={(e) => handleSecurityInput("oldPassword", e.target.value)}
                      className={`input input-bordered rounded-xl text-sm h-11 transition-all ${
                        validationErrors.oldPassword ? "border-error" : ""
                      }`}
                    />
                    {validationErrors.oldPassword && (
                      <label className="label py-1">
                        <span className="label-text-alt text-xs text-error font-medium">
                          {validationErrors.oldPassword}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label py-1.5">
                      <span className="label-text font-semibold text-xs opacity-60 uppercase tracking-wider">
                        New Password
                      </span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new password"
                      value={securityData.newPassword}
                      onChange={(e) => handleSecurityInput("newPassword", e.target.value)}
                      className={`input input-bordered rounded-xl text-sm h-11 transition-all ${
                        validationErrors.newPassword ? "border-error" : ""
                      }`}
                    />
                    {validationErrors.newPassword && (
                      <label className="label py-1">
                        <span className="label-text-alt text-xs text-error font-medium">
                          {validationErrors.newPassword}
                        </span>
                      </label>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label py-1.5">
                      <span className="label-text font-semibold text-xs opacity-60 uppercase tracking-wider">
                        Confirm Password
                      </span>
                    </label>
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={securityData.confirmPassword}
                      onChange={(e) => handleSecurityInput("confirmPassword", e.target.value)}
                      className={`input input-bordered rounded-xl text-sm h-11 transition-all ${
                        validationErrors.confirmPassword ? "border-error" : ""
                      }`}
                    />
                    {validationErrors.confirmPassword && (
                      <label className="label py-1">
                        <span className="label-text-alt text-xs text-error font-medium">
                          {validationErrors.confirmPassword}
                        </span>
                      </label>
                    )}
                  </div>
                </div>

                <div className="mt-4 mb-6">
                  <PasswordChecklist password={securityData.newPassword} />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary rounded-xl px-8 h-11 w-full sm:w-auto shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all"
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
