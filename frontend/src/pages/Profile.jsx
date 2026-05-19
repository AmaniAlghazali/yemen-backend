import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate, Link } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Wrap in useCallback to stabilize the function reference
  const handleLogout = useCallback(() => {
    Cookies.remove("token");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = Cookies.get("token");

      if (!token) {
        handleLogout(); // Use handleLogout here for consistency
        return;
      }

      try {
        const { data } = await axios.get("http://localhost:8000/api/v1/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Full User Data from Backend:", data.user);
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Profile Error:", error.response?.data?.message || error.message);
        handleLogout();
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // 2. Add dependencies to satisfy ESLint
  }, [handleLogout, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-base-100 rounded-[2.5rem] shadow-2xl border border-base-300 relative">
      <div className="absolute -top-6 -left-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>

      <div className="flex flex-col items-center">
        <div className="avatar mb-6">
          <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-2">
            <img
              // 1. Check if user.profile exists
              // 2. Check if it has a .url
              // 3. Fallback to Dicebear
              src={user?.profile?.url ? user.profile.url : "https://api.dicebear.com/7.x/avataaars/svg"}
              alt="Profile"
              className="object-cover"
              onError={(e) => { e.target.src = "https://api.dicebear.com/7.x/avataaars/svg" }} // Fallback if URL is broken
            />
          </div>
        </div>

        <h2 className="text-3xl font-black tracking-tighter uppercase">{user.name}</h2>
        <span className="badge badge-primary badge-sm font-bold mb-6">{user.role}</span>

        <div className="w-full space-y-4 bg-base-200 p-6 rounded-2xl mb-6">
          <div>
            <p className="text-[10px] font-bold opacity-40 uppercase">Email</p>
            <p className="font-semibold">{user.email}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold opacity-40 uppercase">Joined</p>
            <p className="font-semibold">{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="flex flex-col w-full gap-3">
          <Link to="/update-profile" className="btn btn-primary rounded-2xl font-bold uppercase">
            Edit Profile
          </Link>
          <button onClick={handleLogout} className="btn btn-ghost btn-sm text-error font-bold uppercase">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;