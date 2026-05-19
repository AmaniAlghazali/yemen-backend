const Footer = () => {
    return (
        <footer className="bg-neutral text-neutral-content">
            {/* Main Footer Content */}
            <div className="footer container mx-auto p-10 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">

                {/* Brand Section */}
                <aside className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-content font-black text-2xl">
                            A
                        </div>
                        <span className="text-2xl font-black tracking-tighter">AMANI STORE</span>
                    </div>
                    <p className="opacity-70 max-w-xs">
                        Premium quality and fast delivery across Riyadh. <br />
                        Redefining your shopping experience since 2026.
                    </p>
                    <div className="flex gap-4">
                        {/* Social Icons */}
                        <a href="#" className="hover:text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" /></svg>
                        </a>
                        <a href="#" className="hover:text-primary transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" /></svg>
                        </a>
                    </div>
                </aside>

                {/* Links Sections */}
                <nav>
                    <h6 className="footer-title opacity-100 font-bold text-white">Shop</h6>
                    <a className="link link-hover opacity-70">Electronics</a>
                    <a className="link link-hover opacity-70">Clothing</a>
                    <a className="link link-hover opacity-70">Accessories</a>
                    <a className="link link-hover opacity-70">New Arrivals</a>
                </nav>

                <nav>
                    <h6 className="footer-title opacity-100 font-bold text-white">Company</h6>
                    <a className="link link-hover opacity-70">About us</a>
                    <a className="link link-hover opacity-70">Contact</a>
                    <a className="link link-hover opacity-70">Jobs</a>
                    <a className="link link-hover opacity-70">Press kit</a>
                </nav>

                {/* Newsletter Section */}
                <form onSubmit={(e) => e.preventDefault()}>
                    <h6 className="footer-title opacity-100 font-bold text-white">Newsletter</h6>
                    <fieldset className="form-control w-80">
                        <label className="label">
                            <span className="label-text text-neutral-content opacity-70">Enter your email address</span>
                        </label>
                        <div className="join">
                            <input
                                type="text"
                                placeholder="username@site.com"
                                className="input input-bordered join-item bg-neutral-focus text-white border-neutral-content/20 w-full" />
                            <button className="btn btn-primary join-item">Subscribe</button>
                        </div>
                    </fieldset>
                </form>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-neutral-content/10">
                <div className="container mx-auto px-10 py-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm opacity-50">
                    <p>© 2026 Amani Store Riyadh. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:underline">Privacy Policy</a>
                        <a href="#" className="hover:underline">Terms of Service</a>
                        <a href="#" className="hover:underline">Cookies</a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;