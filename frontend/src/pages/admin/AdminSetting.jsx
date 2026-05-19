import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

const AdminSetting = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Profile Settings States
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
  });

  // Security (Password Update) States
  const [securityData, setSecurityData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Global Store Configuration States
  const [storeConfig, setStoreConfig] = useState({
    storeName: "Yemen Marketplace",
    currency: "USD",
    taxRate: "5",
    maintenanceMode: false,
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load Admin User Metadata on mount
  useEffect(() => {
    const cachedUser = localStorage.getItem("user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setProfileData({
          name: parsed.name || "",
          email: parsed.email || "",
          phoneNumber: parsed.phoneNumber || "N/A",
        });
      } catch (e) {
        console.error("Failed to parse cached user string:", e);
      }
    }
  }, []);

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  // Validate password strength
  const validatePassword = (password) => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/[A-Z]/.test(password)) {
      return "Password must contain at least one uppercase letter";
    }
    if (!/[a-z]/.test(password)) {
      return "Password must contain at least one lowercase letter";
    }
    if (!/[0-9]/.test(password)) {
      return "Password must contain at least one number";
    }
    return "";
  };

  // Handle input change with validation
  const handleSecurityInputChange = (field, value) => {
    setSecurityData({ ...securityData, [field]: value });

    // Clear previous validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors({ ...validationErrors, [field]: "" });
    }

    // Validate new password as user types
    if (field === "newPassword" && value) {
      const error = validatePassword(value);
      setValidationErrors((prev) => ({ ...prev, newPassword: error }));
    }
  };

  // 1. Handle Profile Update Changes
  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    // Validate old password is provided
    if (!securityData.oldPassword) {
      toast.error("Please enter your current password to update profile");
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await axios.put(
        `${API_URL}/users/update-profile`,
        {
          name: profileData.name,
          email: profileData.email,
          oldPassword: securityData.oldPassword,
        },
        getAuthHeader(),
      );

      if (res.data.success) {
        toast.success("Profile updated successfully!");
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSecurityData((prev) => ({ ...prev, oldPassword: "" }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsActionLoading(false);
    }
  };

  // 2. Handle Password Change Operations
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setValidationErrors({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    // Validate all fields
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

    const passwordError = validatePassword(securityData.newPassword);
    if (passwordError) {
      setValidationErrors((prev) => ({
        ...prev,
        newPassword: passwordError,
      }));
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
      toast.error("New password cannot be the same as current password");
      return;
    }

    setIsActionLoading(true);
    try {
      const res = await axios.post(
        `${API_URL}/users/update-password`,
        {
          oldPassword: securityData.oldPassword,
          newPassword: securityData.newPassword,
          confirmNewPassword: securityData.confirmPassword,
        },
        getAuthHeader(),
      );

      if (res.data.success) {
        toast.success("Password changed successfully!");
        setSecurityData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      // Handle 404 - endpoint not found on backend
      if (error.response?.status === 404) {
        toast.error(
          "Password update feature is not available. Please add the route to your backend.",
        );
      } else {
        const errorMsg =
          error.response?.data?.message || "Failed to update password";
        toast.error(errorMsg);
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  // 3. Handle Mock Store Adjustments
  const handleSaveStoreConfig = (e) => {
    e.preventDefault();
    toast.success("Store settings saved successfully!");
  };

  return (
    <div className="min-h-screen bg-base-200 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* HEADER BLOCK */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-4 md:p-6 rounded-2xl shadow-sm border border-base-300">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-base-content tracking-tight">
              Settings
            </h2>
            <p className="text-xs md:text-sm text-base-content/60 mt-0.5">
              Manage your account, security, and store settings
            </p>
          </div>
          <Link
            to="/admin"
            className="btn btn-neutral btn-sm rounded-lg gap-2 w-full sm:w-auto h-10 flex-shrink-"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </Link>
        </div>

        {/* INTERACTIVE CONTROLS TABS - Responsive */}
        <div className="tabs tabs-boxed bg-base-100 p-1.5 rounded-xl border border-base-300 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            <button
              onClick={() => setActiveTab("profile")}
              className={`tab rounded-lg text-xs md:text-sm font-medium px-3 md:px-4 h-9 whitespace-nowrap ${
                activeTab === "profile"
                  ? "tab-active bg-primary text-primary-content"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`tab rounded-lg text-xs md:text-sm font-medium px-3 md:px-4 h-9 whitespace-nowrap ${
                activeTab === "security"
                  ? "tab-active bg-primary text-primary-content"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              Security
            </button>
            <button
              onClick={() => setActiveTab("store")}
              className={`tab rounded-lg text-xs md:text-sm font-medium px-3 md:px-4 h-9 whitespace-nowrap ${
                activeTab === "store"
                  ? "tab-active bg-primary text-primary-content"
                  : "text-base-content/60 hover:bg-base-200"
              }`}
            >
              Store
            </button>
          </div>
        </div>

        {/* CONTAINER SHELL FOR DYNAMIC RENDER */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-4 md:p-6">
          {/* TAB 1: PROFILE INTERFACE */}
          {activeTab === "profile" && (
            <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-xl">
              <h3 className="text-base font-bold text-base-content tracking-tight mb-4">
                Profile Information
              </h3>

              <div className="form-control w-full">
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

              <div className="form-control w-full">
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

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                    Phone Number
                  </span>
                </label>
                <input
                  type="text"
                  disabled
                  value={profileData.phoneNumber}
                  className="input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11 bg-base-200 opacity-60 cursor-not-allowed"
                />
              </div>

              <div className="divider text-xs opacity-50">
                Verify Identity to Update
              </div>

              <div className="form-control w-full">
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
                    setSecurityData({
                      ...securityData,
                      oldPassword: e.target.value,
                    })
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
                className="btn btn-primary rounded-lg md:rounded-xl px-6 h-11 mt-4 w-full sm:w-auto"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
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

          {/* TAB 2: SECURITY & PASSWORD */}
          {activeTab === "security" && (
            <form
              onSubmit={handleUpdatePassword}
              className="space-y-4 max-w-xl"
            >
              <h3 className="text-base font-bold text-base-content tracking-tight mb-4">
                Change Password
              </h3>

              <div className="form-control w-full">
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
                    validationErrors.oldPassword
                      ? "border-error focus:border-error"
                      : ""
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

              <div className="form-control w-full">
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
                    validationErrors.newPassword
                      ? "border-error focus:border-error"
                      : ""
                  }`}
                />
                {validationErrors.newPassword ? (
                  <label className="label py-1">
                    <span className="label-text-alt text-xs text-error">
                      {validationErrors.newPassword}
                    </span>
                  </label>
                ) : (
                  <label className="label py-1">
                    <span className="label-text-alt text-[11px] opacity-50">
                      Min 8 chars, uppercase, lowercase & number
                    </span>
                  </label>
                )}
              </div>

              <div className="form-control w-full">
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
                    validationErrors.confirmPassword
                      ? "border-error focus:border-error"
                      : ""
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

              {/* Password Requirements Checklist */}
              <div className="bg-base-200/50 p-3 rounded-lg text-xs space-y-1">
                <p className="font-medium text-base-content/70 mb-2">
                  Password Requirements:
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      securityData.newPassword.length >= 8
                        ? "bg-success text-success-content"
                        : "bg-base-300"
                    }`}
                  >
                    {securityData.newPassword.length >= 8 && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={
                      securityData.newPassword.length >= 8
                        ? "text-success"
                        : "text-base-content/50"
                    }
                  >
                    At least 8 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      /[A-Z]/.test(securityData.newPassword)
                        ? "bg-success text-success-content"
                        : "bg-base-300"
                    }`}
                  >
                    {/[A-Z]/.test(securityData.newPassword) && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={
                      /[A-Z]/.test(securityData.newPassword)
                        ? "text-success"
                        : "text-base-content/50"
                    }
                  >
                    One uppercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      /[a-z]/.test(securityData.newPassword)
                        ? "bg-success text-success-content"
                        : "bg-base-300"
                    }`}
                  >
                    {/[a-z]/.test(securityData.newPassword) && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={
                      /[a-z]/.test(securityData.newPassword)
                        ? "text-success"
                        : "text-base-content/50"
                    }
                  >
                    One lowercase letter
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center ${
                      /[0-9]/.test(securityData.newPassword)
                        ? "bg-success text-success-content"
                        : "bg-base-300"
                    }`}
                  >
                    {/[0-9]/.test(securityData.newPassword) && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <span
                    className={
                      /[0-9]/.test(securityData.newPassword)
                        ? "text-success"
                        : "text-base-content/50"
                    }
                  >
                    One number
                  </span>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary rounded-lg md:rounded-xl px-6 h-11 mt-4 w-full sm:w-auto"
                disabled={isActionLoading}
              >
                {isActionLoading ? (
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

          {/* TAB 3: STORE SETTINGS */}
          {activeTab === "store" && (
            <form
              onSubmit={handleSaveStoreConfig}
              className="space-y-5 max-w-xl"
            >
              <h3 className="text-base font-bold text-base-content tracking-tight mb-4">
                Store Settings
              </h3>

              <div className="form-control w-full">
                <label className="label py-1">
                  <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                    Store Name
                  </span>
                </label>
                <input
                  type="text"
                  value={storeConfig.storeName}
                  onChange={(e) =>
                    setStoreConfig({
                      ...storeConfig,
                      storeName: e.target.value,
                    })
                  }
                  className="input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                      Currency
                    </span>
                  </label>
                  <select
                    value={storeConfig.currency}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        currency: e.target.value,
                      })
                    }
                    className="select select-bordered w-full rounded-lg md:rounded-xl text-sm h-11 min-h-0"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="YER">YER (﷼) - Yemeni Rial</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="SAR">SAR (﷼) - Saudi Riyal</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>

                <div className="form-control w-full">
                  <label className="label py-1">
                    <span className="label-text font-medium text-xs md:text-sm text-base-content/70">
                      Tax Rate (%)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    value={storeConfig.taxRate}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        taxRate: e.target.value,
                      })
                    }
                    className="input input-bordered w-full rounded-lg md:rounded-xl text-sm h-11"
                  />
                </div>
              </div>

              <div className="form-control bg-base-200/50 p-4 rounded-lg border border-base-200 mt-2">
                <label className="label cursor-pointer justify-between items-center p-0">
                  <div className="flex flex-col pr-4">
                    <span className="label-text font-bold text-sm text-base-content">
                      Maintenance Mode
                    </span>
                    <span className="text-[11px] md:text-xs text-base-content/50 mt-0.5">
                      Enable to show a maintenance page to users
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={storeConfig.maintenanceMode}
                    onChange={(e) =>
                      setStoreConfig({
                        ...storeConfig,
                        maintenanceMode: e.target.checked,
                      })
                    }
                    className="toggle toggle-primary toggle-md"
                  />
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary rounded-lg md:rounded-xl px-6 h-11 mt-2 w-full sm:w-auto"
              >
                Save Settings
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSetting;
