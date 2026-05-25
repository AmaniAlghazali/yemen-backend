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
        }
      } catch (error) {
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
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }
  if (!user) return null;

  const avatarSrc =
    user.profileUrl && user.profileUrl !== "url"
      ? user.profileUrl
      : "https://api.dicebear.com/7.x/avataaars/svg";

  const stats = [
    { label: "Orders", value: user.ordersCount ?? "—" },
    { label: "Wishlist", value: user.wishlistCount ?? "—" },
    { label: "Joined", value: new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) },
  ];

  return (
    <div className="min-h-screen bg-base-200 py-6 md:py-10 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
              Profile
            </h1>
            <p className="text-xs md:text-sm opacity-50 font-medium mt-1">
              Your account overview
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-base-100 rounded-2xl border border-base-300 shadow-sm p-6 md:p-8">
          {/* Avatar & Name */}
          <div className="flex flex-col items-center text-center mb-6 pb-6 border-b border-base-200">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full ring-2 ring-primary/20 ring-offset-2 overflow-hidden mb-4">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://api.dicebear.com/7.x/avataaars/svg";
                }}
              />
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight uppercase">
              {user.name}
            </h2>
            <span className="badge badge-primary badge-sm font-bold mt-1">
              {user.role}
            </span>
          </div>

          {/* Info */}
          <div className="bg-base-200/50 rounded-xl p-4 space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold opacity-40 uppercase tracking-wider">
                Email
              </span>
              <span className="text-sm font-semibold truncate ml-4">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold opacity-40 uppercase tracking-wider">
                  Phone
                </span>
                <span className="text-sm font-semibold">{user.phone}</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="bg-base-200/50 rounded-xl p-3 text-center"
              >
                <p className="text-lg font-black">{stat.value}</p>
                <p className="text-[10px] font-bold opacity-40 uppercase tracking-wider mt-0.5">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2">
            <Link
              to="/update-profile"
              className="btn btn-primary rounded-xl font-bold uppercase tracking-wider h-11"
            >
              Edit Profile
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-ghost rounded-xl font-bold uppercase tracking-wider h-11 text-error"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
