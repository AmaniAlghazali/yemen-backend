import { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getToken = () => Cookies.get("token") || localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
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
          setUser(data.user);
          if (data.user.profileUrl && data.user.profileUrl !== "url") {
            localStorage.setItem("userAvatar", data.user.profileUrl);
          }
        }
      } catch {
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-base-200">
        <span className="loading loading-dots loading-lg text-primary" />
      </div>
    );
  }
  if (!user) return null;

  const avatarSrc =
    user.profileUrl && user.profileUrl !== "url"
      ? user.profileUrl
      : "https://api.dicebear.com/7.x/avataaars/svg";

  const joined = new Date(user.createdAt);
  const memberSince = joined.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-200 via-base-100 to-base-200">
      {/* Gradient Header */}
      <div className="relative h-44 md:h-52 bg-gradient-to-br from-primary/80 via-primary to-secondary/70 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-16 w-80 h-80 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-24 pb-10 relative z-10">
        {/* Profile Card */}
        <div className="bg-base-100 rounded-3xl shadow-xl border border-base-200 overflow-hidden">
          {/* Avatar Section */}
          <div className="flex flex-col items-center pt-8 pb-6 px-6 relative">
            <div className="w-28 h-28 rounded-full ring-4 ring-base-100 shadow-xl overflow-hidden -mt-16 mb-4">
              <img
                src={avatarSrc}
                alt={user.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://api.dicebear.com/7.x/avataaars/svg";
                }}
              />
            </div>
            <h2 className="text-2xl font-bold text-base-content text-center">{user.name}</h2>
            <span className="badge badge-primary badge-sm font-semibold mt-1.5 px-3 py-2">
              {user.role}
            </span>
          </div>

          {/* Info Items */}
          <div className="px-6 pb-4 space-y-3">
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-base-200/60">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium opacity-40 uppercase tracking-wider">Email</p>
                <p className="text-sm font-semibold truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-base-200/60">
              <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium opacity-40 uppercase tracking-wider">Member Since</p>
                <p className="text-sm font-semibold">{memberSince}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-px bg-base-300 mx-6 rounded-xl overflow-hidden">
            {[
              { label: "Orders", value: user.ordersCount ?? "—", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
              { label: "Wishlist", value: user.wishlistCount ?? "—", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
              { label: "Reviews", value: user.reviewsCount ?? "—", icon: "M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" },
            ].map((stat) => (
              <div key={stat.label} className="bg-base-100 p-4 text-center">
                <svg className="w-4 h-4 mx-auto mb-1.5 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={stat.icon} />
                </svg>
                <p className="text-xl font-black tracking-tight">{stat.value}</p>
                <p className="text-[10px] font-semibold opacity-40 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="p-6 flex flex-col gap-2.5">
            <Link
              to="/update-profile"
              className="btn btn-primary rounded-xl font-semibold tracking-wide h-11 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-ghost rounded-xl font-semibold tracking-wide h-11 text-error/80 hover:text-error hover:bg-error/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
