const Contact = () => {
    return (
        <div className="bg-base-100 min-h-screen font-sans py-12 px-4 md:px-8">
            <div className="container mx-auto max-w-6xl">

                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-black mb-4">Get in Touch</h1>
                    <p className="text-lg opacity-60">Have a question about an order or a product? We're here to help.</p>
                </div>

                <div className="grid lg:grid-cols-2 gap-12 items-start">

                    {/* 1. Contact Form Card */}
                    <div className="card bg-base-200 shadow-xl p-8 rounded-3xl border border-base-300">
                        <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-bold">Full Name</span></label>
                                    <input type="text" placeholder="Amani Al-Ghazali" className="input input-bordered rounded-xl focus:input-primary" />
                                </div>
                                <div className="form-control">
                                    <label className="label"><span className="label-text font-bold">Email Address</span></label>
                                    <input type="email" placeholder="name@example.com" className="input input-bordered rounded-xl focus:input-primary" />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-bold">Subject</span></label>
                                <select className="select select-bordered rounded-xl focus:select-primary">
                                    <option>Order Inquiry</option>
                                    <option>Technical Support</option>
                                    <option>Returns & Refunds</option>
                                    <option>Other</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label"><span className="label-text font-bold">Message</span></label>
                                <textarea className="textarea textarea-bordered h-32 rounded-xl focus:textarea-primary" placeholder="How can we help you today?"></textarea>
                            </div>

                            <button className="btn btn-primary btn-block rounded-xl text-lg font-bold">
                                Send Message
                            </button>
                        </form>
                    </div>

                    {/* 2. Contact Information & Map Area */}
                    <div className="space-y-8">
                        <div className="grid sm:grid-cols-2 gap-6">
                            {/* Location */}
                            <div className="flex gap-4 p-6 bg-base-200 rounded-2xl border border-base-300">
                                <div className="text-3xl text-primary">📍</div>
                                <div>
                                    <h3 className="font-black text-lg">Visit Us</h3>
                                    <p className="opacity-70 text-sm">Digital City, Riyadh<br />Saudi Arabia</p>
                                </div>
                            </div>

                            {/* Call */}
                            <div className="flex gap-4 p-6 bg-base-200 rounded-2xl border border-base-300">
                                <div className="text-3xl text-secondary">📞</div>
                                <div>
                                    <h3 className="font-black text-lg">Call Us</h3>
                                    <p className="opacity-70 text-sm">+966 50 000 0000<br />Sun-Thu, 9am-5pm</p>
                                </div>
                            </div>
                        </div>

                        {/* Visual Placeholder for Map */}
                        <div className="w-full h-80 bg-base-300 rounded-3xl overflow-hidden relative group border border-base-300">
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-neutral/10 group-hover:bg-neutral/20 transition-all">
                                <p className="text-5xl mb-2">🗺️</p>
                                <p className="font-bold text-xl">Find us in Riyadh</p>
                                <p className="text-sm opacity-60">Interactive Map Loading...</p>
                            </div>
                            {/* When you're ready, replace this div with an <iframe> for Google Maps */}
                        </div>

                        {/* Social Proof / Trust */}
                        <div className="p-8 bg-primary text-primary-content rounded-3xl">
                            <h3 className="text-2xl font-black mb-2">Live Support</h3>
                            <p className="mb-4 opacity-90">Our average response time is under 2 hours during business hours.</p>
                            <button className="btn btn-ghost bg-white/20 hover:bg-white/30 border-none text-white rounded-xl">
                                Chat with an expert
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Contact;