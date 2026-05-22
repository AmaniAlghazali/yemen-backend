import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const RIYADH_CENTER = [24.7136, 46.6753];

function ClickableMarker({ position, setPosition }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position ? <Marker position={position} /> : null;
}

const Contact = () => {
    const [form, setForm] = useState({ name: "", email: "", subject: "Order Inquiry", message: "" });
    const [position, setPosition] = useState(null);
    const [sending, setSending] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const payload = { ...form };
            if (position) {
                payload.lat = position[0];
                payload.lng = position[1];
            }
            const res = await axios.post("/api/v1/users/contact", payload);
            if (res.data.success) {
                toast.success("Message sent! We'll get back to you soon.");
                setForm({ name: "", email: "", subject: "Order Inquiry", message: "" });
                setPosition(null);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="bg-base-100 min-h-screen font-sans py-8 md:py-12 px-4">
            <div className="container mx-auto max-w-6xl">
                <div className="text-center mb-10 md:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-4">Get in Touch</h1>
                    <p className="text-base md:text-lg opacity-60">Have a question about an order or a product? We're here to help.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-start">
                    <div className="card bg-base-200 shadow-xl p-6 md:p-8 rounded-3xl border border-base-300">
                        <form className="space-y-5 md:space-y-6" onSubmit={handleSubmit}>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-bold text-sm">Full Name</span></label>
                                    <input type="text" required placeholder="Your name"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="input input-bordered rounded-xl focus:input-primary" />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-bold text-sm">Email Address</span></label>
                                    <input type="email" required placeholder="name@example.com"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="input input-bordered rounded-xl focus:input-primary" />
                                </div>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-bold text-sm">Subject</span></label>
                                <select className="select select-bordered rounded-xl focus:select-primary"
                                    value={form.subject}
                                    onChange={e => setForm({ ...form, subject: e.target.value })}>
                                    <option>Order Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Returns & Refunds</option>
                                    <option>Other</option>
                                </select>
                            </div>
                            <div className="form-control">
                                <label className="label"><span className="label-text font-bold text-sm">Message</span></label>
                                <textarea className="textarea textarea-bordered h-32 rounded-xl focus:textarea-primary"
                                    placeholder="How can we help you today?"
                                    value={form.message}
                                    onChange={e => setForm({ ...form, message: e.target.value })}
                                    required></textarea>
                            </div>
                            <button type="submit" disabled={sending}
                                className="btn btn-primary btn-block rounded-xl text-lg font-bold">
                                {sending ? <><span className="loading loading-spinner loading-sm mr-2"></span>Sending...</> : "Send Message"}
                            </button>
                        </form>
                    </div>

                    <div className="space-y-6 md:space-y-8">
                        <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
                            <div className="flex gap-4 p-5 md:p-6 bg-base-200 rounded-2xl border border-base-300">
                                <div className="text-3xl text-primary shrink-0">📍</div>
                                <div>
                                    <h3 className="font-black text-base md:text-lg">Visit Us</h3>
                                    <p className="opacity-70 text-sm">Digital City, Riyadh<br />Saudi Arabia</p>
                                </div>
                            </div>
                            <div className="flex gap-4 p-5 md:p-6 bg-base-200 rounded-2xl border border-base-300">
                                <div className="text-3xl text-secondary shrink-0">📞</div>
                                <div>
                                    <h3 className="font-black text-base md:text-lg">Call Us</h3>
                                    <p className="opacity-70 text-sm">+966 50 000 0000<br />Sun-Thu, 9am-5pm</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-bold opacity-40 uppercase tracking-widest">
                                {position
                                    ? `Selected: ${position[0].toFixed(4)}, ${position[1].toFixed(4)}`
                                    : "Click on the map to pin your location"}
                            </p>
                            <div className="w-full h-64 md:h-80 rounded-3xl overflow-hidden border border-base-300 z-0">
                                <MapContainer center={RIYADH_CENTER} zoom={13} className="w-full h-full" scrollWheelZoom={true}>
                                    <TileLayer
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <ClickableMarker position={position} setPosition={setPosition} />
                                </MapContainer>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 bg-primary text-primary-content rounded-3xl">
                            <h3 className="text-xl md:text-2xl font-black mb-2">Live Support</h3>
                            <p className="mb-4 opacity-90 text-sm md:text-base">Our average response time is under 2 hours during business hours.</p>
                            <a href="mailto:support@example.com" className="btn btn-ghost bg-white/20 hover:bg-white/30 border-none text-white rounded-xl w-full sm:w-auto">
                                Email Support
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;