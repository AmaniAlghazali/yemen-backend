import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(
    "/images/default_avatar.png",
  );
  const [avatar, setAvatar] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    oldPassword: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchUser = async () => {
      const token = Cookies.get("token");
      try {
        const { data } = await axios.get(
          "http://localhost:8000/api/v1/users/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (data.success) {
          setFormData((prev) => ({
            ...prev,
            name: data.user.name,
            email: data.user.email,
          }));
          setAvatarPreview(
            data.user.profile?.url || "/images/default_avatar.png",
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side Check: New must be different from Old
    if (formData.password && formData.password === formData.oldPassword) {
      return alert(
        "New password must be different from your current password!",
      );
    }

    // 2. Client-side Check: Confirm Match
    if (formData.password && formData.password !== formData.confirmPassword) {
      return alert("New passwords do not match!");
    }

    setLoading(true);
    const token = Cookies.get("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      // --- STEP 1: UPDATE PASSWORD ---
      if (formData.password) {
        await axios.post(
          "http://localhost:8000/api/v1/users/update-password",
          {
            oldPassword: formData.oldPassword,
            newPassword: formData.password,
            confirmNewPassword: formData.confirmPassword,
          },
          { headers },
        );
      }

      // --- STEP 2: UPDATE NAME/EMAIL/AVATAR ---
      // This only runs if Step 1 succeeds!
      const updateData = {
        name: formData.name,
        email: formData.email,
        avatar: avatar || undefined,
        oldPassword: formData.oldPassword || undefined, // Only send if user entered it
      };

      const { data } = await axios.put(
        "http://localhost:8000/api/v1/users/update-profile",
        updateData,
        { headers },
      );

      if (data.success) {
        alert("Profile and Password Updated Successfully!");
        navigate("/profile");
      }
    } catch (err) {
      // Handles "Incorrect current password" or "Password same as old" from Backend
      const errorMessage = err.response?.data?.message || "Update failed";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-8">
      <div className="max-w-md w-full bg-base-100 p-8 rounded-4xl shadow-xl border border-base-300">
        <h1 className="text-2xl font-black text-center uppercase mb-6">
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-2">
            <div className="avatar">
              <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-2">
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="object-cover"
                />
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered file-input-xs w-full max-w-xs"
            />
          </div>

          {/* Basic Info */}
          <div className="space-y-3">
            <div className="form-control">
              <label className="label-text font-bold text-[10px] uppercase ml-1 opacity-50">
                Full Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Amani Al-Ghazali"
                className="input input-bordered w-full rounded-xl"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-control">
              <label className="label-text font-bold text-[10px] uppercase ml-1 opacity-50">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                placeholder="email@example.com"
                className="input input-bordered w-full rounded-xl"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="divider text-[10px] uppercase font-bold opacity-40">
            Security Verification
          </div>

          {/* Current Password Field */}
          <div className="form-control">
            <label className="label-text font-bold text-[10px] uppercase ml-1 text-primary">
              Current Password (Required to save)
            </label>
            <div className="relative">
              <input
                name="oldPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input input-bordered border-primary w-full rounded-xl pr-10"
                value={formData.oldPassword}
                onChange={handleInputChange}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 opacity-40 hover:opacity-100"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <div className="divider text-[10px] uppercase font-bold opacity-40">
            Change Password
          </div>

          {/* New Password */}
          <div className="form-control">
            <label className="label-text font-bold text-[10px] uppercase ml-1 opacity-50">
              New Password (Optional)
            </label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input input-bordered w-full rounded-xl pr-10"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="form-control">
            <label className="label-text font-bold text-[10px] uppercase ml-1 opacity-50">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="input input-bordered w-full rounded-xl pr-10"
                value={formData.confirmPassword}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary btn-block rounded-xl shadow-lg mt-4 ${loading ? "loading" : ""}`}
          >
            {loading ? "Saving Changes..." : "Update Profile"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;
