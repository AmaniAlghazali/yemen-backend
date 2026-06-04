import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import Cookies from "js-cookie";
import { toast } from 'react-toastify';

const SignUp = () => {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [showPassword, setShowPassword] = useState(false);
    const [avatar, setAvatar] = useState(""); // Base64 string for backend
    const [avatarPreview, setAvatarPreview] = useState("https://api.dicebear.com/7.x/avataaars/svg?seed=newuser");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Handle Image Selection and Preview
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
        setLoading(true);

        try {
            // Create a payload including the avatar
            const registrationData = {
                ...formData,
                avatar: avatar // If empty, backend uses default
            };

            const response = await axios.post("/api/v1/users/register-user", registrationData);
            
            toast.success("Registration Successful!");
            const token = response.data.token;
            
            Cookies.set("token", token, { expires: 7, secure: false });
            navigate("/");
        } catch (error) {
            const backendMessage = error.response?.data?.message || "Registration Failed";
            toast.error(backendMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 px-4 py-10">
            <div className="max-w-md w-full bg-base-100 p-10 rounded-[2.5rem] shadow-2xl border border-base-300 relative overflow-hidden">
                {/* Decoration */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>

                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Join Us</h1>
                    <p className="text-sm opacity-50 font-medium">Create your profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* AVATAR SECTION */}
                    <div className="flex flex-col items-center gap-3 mb-6">
                        <div className="avatar">
                            <div className="w-24 h-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 shadow-xl bg-base-200">
                                <img src={avatarPreview} alt="Avatar Preview" />
                            </div>
                        </div>
                        <label className="flex flex-col items-center justify-center">
                            <span className="text-[10px] font-bold uppercase opacity-60 mb-2">Upload Profile Photo</span>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="file-input file-input-bordered file-input-primary file-input-xs w-full max-w-xs rounded-full"
                            />
                        </label>
                    </div>

                    <div className="form-control">
                        <label className="label-text font-bold text-xs uppercase mb-2 ml-1">Full Name</label>
                        <input
                            type="text"
                            className="input input-bordered w-full rounded-2xl focus:input-primary"
                            placeholder="Your Name"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label-text font-bold text-xs uppercase mb-2 ml-1">Email Address</label>
                        <input
                            type="email"
                            className="input input-bordered w-full rounded-2xl focus:input-primary"
                            placeholder="email@example.com"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label-text font-bold text-xs uppercase mb-2 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="input input-bordered w-full rounded-2xl focus:input-primary pr-12"
                                placeholder="••••••••"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <button
                                type="button"
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-xl opacity-50 hover:opacity-100"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "👁️" : "🙈"}
                            </button>
                        </div>
                    </div>

                    <button 
                        disabled={loading}
                        className={`btn btn-primary btn-block rounded-2xl font-black text-lg shadow-lg hover:scale-[1.02] transition-all mt-4 ${loading ? 'loading' : ''}`}
                    >
                        {loading ? "Creating Account..." : "Register"}
                    </button>
                </form>

                <div className="mt-8 text-center text-sm">
                    <span className="opacity-50">Already have an account? </span>
                    <Link to="/login" className="font-bold text-primary hover:underline">Log In</Link>
                </div>
            </div>
        </div>
    );
};

export default SignUp;