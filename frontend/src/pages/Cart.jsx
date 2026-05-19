import { useState } from "react";
import { Link } from "react-router-dom";

const Cart = () => {
    const [cartItems, setCartItems] = useState(() => {
        const savedCart = localStorage.getItem("cart");
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Update localStorage and refresh state
    const updateCart = (newCart) => {
        setCartItems(newCart);
        localStorage.setItem("cart", JSON.stringify(newCart));
        window.dispatchEvent(new Event("cartUpdated")); // Keep Navbar in sync
    };

    const removeItemByIndex = (indexToRemove) => {
        const filtered = cartItems.filter((_, index) => index !== indexToRemove);
        updateCart(filtered);
    };

    const adjustQty = (id, amount) => {
        const updated = cartItems.map((item) => {
            // Find the specific item and change its quantity
            if (item.id === id) {
                const newQty = Math.max(1, item.quantity + amount);
                return { ...item, quantity: newQty };
            }
            return item;
        });
        updateCart(updated);
    };

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const vat = subtotal * 0.15; // 15% VAT for Saudi Arabia
    const total = subtotal + vat;

    if (cartItems.length === 0) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
                <h2 className="text-2xl font-bold opacity-50">Your cart is empty</h2>
                <Link to="/" className="btn btn-primary rounded-xl px-8">Continue Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">
            <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-10">

                {/* LEFT: Item List (Amazon Style) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* FIXED: Added 'index' to the arguments here */}
                    {cartItems.map((item, index) => (
                        <div key={index} className="card card-side bg-base-100 shadow-xl border border-base-200 overflow-hidden rounded-3xl p-4">
                            <figure className="w-32 h-32 shrink-0">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-2xl" />
                            </figure>
                            <div className="card-body py-0 pr-0">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="card-title text-xl font-bold">{item.title}</h2>
                                        <p className="text-sm opacity-50 font-medium uppercase">Category</p>
                                    </div>
                                    <p className="text-xl font-black text-primary">{item.price} SAR</p>
                                </div>

                                <div className="card-actions justify-between items-center mt-4">
                                    <div className="join border border-base-300 rounded-xl">
                                        <button className="btn btn-ghost btn-sm join-item" onClick={() => adjustQty(item.id, -1)}>-</button>
                                        <span className="px-4 flex items-center font-bold text-sm">{item.quantity}</span>
                                        <button className="btn btn-ghost btn-sm join-item" onClick={() => adjustQty(item.id, 1)}>+</button>
                                    </div>
                                    {/* Now 'index' is defined and safe to use */}
                                    <button onClick={() => removeItemByIndex(index)} className="btn btn-ghost btn-sm text-error font-bold hover:bg-error/10">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Order Summary */}
                <div className="lg:col-span-1">
                    <div className="card bg-base-100 shadow-2xl border border-base-300 rounded-[2.5rem] p-8 sticky top-24">
                        <h3 className="text-xl font-black mb-6 uppercase">Order Summary</h3>

                        <div className="space-y-4 mb-6">
                            <div className="flex justify-between opacity-70 font-medium">
                                <span>Subtotal</span>
                                <span>{subtotal.toFixed(2)} SAR</span>
                            </div>
                            <div className="flex justify-between opacity-70 font-medium">
                                <span>Shipping</span>
                                <span className="text-success font-bold uppercase">Free</span>
                            </div>
                            <div className="flex justify-between opacity-70 font-medium">
                                <span>VAT (15%)</span>
                                <span>{vat.toFixed(2)} SAR</span>
                            </div>
                            <div className="divider"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-3xl font-black text-primary">{total.toFixed(2)} SAR</span>
                            </div>
                        </div>

                        <button className="btn btn-primary btn-block btn-lg rounded-2xl font-black text-lg shadow-lg">
                            Proceed to Checkout
                        </button>
                        <p className="text-[10px] text-center mt-4 opacity-40 font-bold uppercase tracking-widest">
                            Secure Checkout • Fast Delivery in Riyadh
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;