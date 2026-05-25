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

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token") || localStorage.getItem("token");
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
      } catch (err) {
        console.error(err);
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

  const handleSecurityInputChange = (field, value) => {
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

  const getToken = () => Cookies.get("token") || localStorage.getItem("token");
  const getAuthHeader = () => ({
    headers: { Authorization: `Bearer ${getToken()}` },
  });

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
      setValidationErrors((prev) => ({
        ...prev,
        oldPassword: "Current password is required",
      }));
      return;
    }
    if (!securityData.newPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: "New password is required",
      }));
      return;
    }
    const pwdError = validatePassword(securityData.newPassword);
    if (pwdError) {
      setValidationErrors((prev) => ({ ...prev, newPassword: pwdError }));
      return;
    }
    if (!securityData.confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Please confirm your new password",
      }));
      return;
    }
    if (securityData.newPassword !== securityData.confirmPassword) {
      setValidationErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
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
    <div className="bg-base-200/50 p-3 rounded-lg text-xs space-y-1.5">
      <p className="font-medium text-base-content/70 mb-1.5">
        Password Requirements:
      </p>
      {[
        { label: "At least 8 characters", test: password.length >= 8 },
        { label: "One uppercase letter", test: /[A-Z]/.test(password) },
        { label: "One lowercase letter", test: /[a-z]/.test(password) },
        { label: "One number", test: /[0-9]/.test(password) },
      ].map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
              item.test ? "bg-success text-success-content" : "bg-base-300"
            }`}
          >
            {item.test && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className={item.test ? "text-success" : "text-base-content/50"}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );

  const TabButton = ({ id, label, active, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`tab rounded-lg text-xs md:text-sm font-medium px-3 md:px-4 h-9 whitespace-nowrap ${
        active === id
          ? "tab-active bg-primary text-primary-content"
          : "text-base-content/60 hover:bg-base-200"
      }`}
    >
      {label}
    </button>
  );

  if (fetching) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-200 py-6 md:py-10 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Settings
            </h1>
            <p className="text-xs md:text-sm opacity-50 font-medium mt-1">
              Manage your account and security preferences
            </p>
          </div>
          <Link to="/profile" className="btn btn-ghost btn-sm rounded-xl gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </Link>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed bg-base-100 p-1.5 rounded-xl border border-base-300 overflow-x-auto mb-6">
          <div className="flex gap-1 min-w-max">
            <TabButton id="profile" label="Profile" active={activeTab} onClick={setActiveTab} />
            <TabButton id="security" label="Security" active={activeTab} onClick={setActiveTab} />
          </div>
        </div>

        {/* Content */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4 md:p-6 lg:p-8">
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="max-w-2xl">
              {/* Avatar */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8 pb-8 border-b border-base-200">
                <div className="relative group">
                  <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-2 ring-primary/20 ring-offset-2 overflow-hidden">
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://api.dicebear.com/7.x/avataaars/svg";
                      }}
                    />
                  </div>
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-lg md:text-xl font-bold">{profileData.name}</h2>
                  <p className="text-xs md:text-sm opacity-50">{profileData.email}</p>
                  <p className="text-[11px] opacity-40 mt-1">
                    Click the avatar to change your photo
                  </p>
                </div>
              </div>

              {/* Profile fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                      Full Name
                    </span>
                  </label>
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                      Email Address
                    </span>
                  </label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                    className="input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11"
                    required
                  />
                </div>
              </div>

              {/* Verify identity */}
              <div className="divider text-xs opacity-50">Verify Identity to Update</div>

              <div className="form-control max-w-sm mb-6">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs md:text-sm text-error">
                    Current Password
                  </span>
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={securityData.oldPassword}
                  onChange={(e) =>
                    setSecurityData({ ...securityData, oldPassword: e.target.value })
                  }
                  className="input input-bordered border-error/30 w-full rounded-lg md:rounded-xl text-sm h-11 focus:border-error"
                  required
                />
                <label className="label py-1">
                  <span className="label-text-alt text-[11px] opacity-50">
                    Required to save profile changes
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary rounded-lg md:rounded-xl px-6 h-11 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleUpdatePassword} className="max-w-2xl">
              <h3 className="text-base font-bold text-base-content tracking-tight mb-6">
                Change Password
              </h3>

              <div className="space-y-4 max-w-md">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                      Current Password
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={securityData.oldPassword}
                    onChange={(e) =>
                      handleSecurityInputChange("oldPassword", e.target.value)
                    }
                    className={`input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11 ${
                      validationErrors.oldPassword ? "border-error" : ""
                    }`}
                  />
                  {validationErrors.oldPassword && (
                    <label className="label py-1">
                      <span className="label-text-alt text-xs text-error">
                        {validationErrors.oldPassword}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                      New Password
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={securityData.newPassword}
                    onChange={(e) =>
                      handleSecurityInputChange("newPassword", e.target.value)
                    }
                    className={`input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11 ${
                      validationErrors.newPassword ? "border-error" : ""
                    }`}
                  />
                  {validationErrors.newPassword && (
                    <label className="label py-1">
                      <span className="label-text-alt text-xs text-error">
                        {validationErrors.newPassword}
                      </span>
                    </label>
                  )}
                </div>

                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                      Confirm New Password
                    </span>
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter new password"
                    value={securityData.confirmPassword}
                    onChange={(e) =>
                      handleSecurityInputChange("confirmPassword", e.target.value)
                    }
                    className={`input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11 ${
                      validationErrors.confirmPassword ? "border-error" : ""
                    }`}
                  />
                  {validationErrors.confirmPassword && (
                    <label className="label py-1">
                      <span className="label-text-alt text-xs text-error">
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
                className="btn btn-primary rounded-lg md:rounded-xl px-6 h-11 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-xs mr-2"></span>
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateProfile;
