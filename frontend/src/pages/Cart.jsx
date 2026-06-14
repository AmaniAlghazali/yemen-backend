import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";
import { toast } from "react-toastify";
import StripeCardForm from "../components/StripeCardForm";

const DEFAULT_METHODS = [
  { id: "credit_card", name: "Credit / Debit Card", icon: "💳", description: "Pay with Visa, Mastercard, or other cards" },
  { id: "cod", name: "Cash on Delivery", icon: "💵", description: "Pay when you receive your order" },
];

const Cart = () => {
  const { store } = useStore();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [paymentMethods, setPaymentMethods] = useState(DEFAULT_METHODS);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    city: "",
    country: "",
    zipCode: "",
    mobileNo: "",
  });

  const [cardStep, setCardStep] = useState(null);
  const [clientSecret, setClientSecret] = useState(null);
  const [currentOrderId, setCurrentOrderId] = useState(null);

  const stripePromise = useMemo(
    () => (store.stripePublishableKey ? loadStripe(store.stripePublishableKey) : null),
    [store.stripePublishableKey]
  );

  const token = localStorage.getItem("token");

  const fetchCart = async () => {
    const t = localStorage.getItem("token");
    if (!t) {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("/api/v1/cart", {
        headers: { Authorization: `Bearer ${t}` },
        timeout: 5000,
      });
      setCartItems(res.data.cart?.items || []);
    } catch {
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handler = () => fetchCart();
    window.addEventListener("cartUpdated", handler);
    handler();
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (!t) return;
    axios.get("/api/v1/payments/methods", {
      headers: { Authorization: `Bearer ${t}` },
    }).then((res) => {
      if (res.data.success) {
        const enabled = res.data.methods.filter((m) => m.enabled);
        if (enabled.length) setPaymentMethods(enabled);
      }
    }).catch(() => {});
  }, []);

  const removeItem = async (productId) => {
    try {
      const res = await axios.delete(
        `/api/v1/cart/remove/${productId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.cart?.items || []);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const adjustQty = async (productId, amount) => {
    const item = cartItems.find((i) => i.productId === productId);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + amount);
    try {
      const res = await axios.put(
        `/api/v1/cart/update/${productId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems(res.data.cart?.items || []);
      window.dispatchEvent(new Event("cartUpdated"));
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const taxRate = store.taxRate / 100;
  const vat = subtotal * taxRate;
  const total = subtotal + vat;

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please login first!");
      navigate("/login");
      return;
    }

    setCheckingOut(true);
    try {
      const cleanMobile = shippingInfo.mobileNo.replace(/[^0-9]/g, "");
      const orderPayload = {
        shippingInfo: {
          ...shippingInfo,
          mobileNo: cleanMobile,
          zipCode: shippingInfo.zipCode.replace(/[^0-9]/g, ""),
        },
        items: cartItems.map((item) => ({
          productId: item.productId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
        })),
        paymentMethod,
        taxPrice: vat,
        shippingCost: 0,
        totalPrice: total,
      };

      if (paymentMethod === "cod") {
        orderPayload.paymentId = `cod_${Date.now()}`;
        orderPayload.paymentStatus = "pending";
        const res = await axios.post(
          "/api/v1/orders/create-order",
          orderPayload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success) {
          toast.success("Order placed successfully! Pay on delivery.");
          setCartItems([]);
          window.dispatchEvent(new Event("cartUpdated"));
          setShowCheckout(false);
          navigate("/");
        }
        return;
      }

      const orderRes = await axios.post(
        "/api/v1/orders/create-order",
        { ...orderPayload, paymentId: `pending_${Date.now()}`, paymentStatus: "pending" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!orderRes.data.success) {
        toast.error("Failed to create order");
        return;
      }

      const orderId = orderRes.data.order.id;

      if (paymentMethod === "credit_card") {
        setCardStep("creating");
        const piRes = await axios.post(
          "/api/v1/payments/create-payment-intent",
          { amount: total, currency: store.currency || "USD", orderId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!piRes.data.success) {
          toast.error("Failed to initialize card payment");
          setCardStep(null);
          return;
        }
        setClientSecret(piRes.data.clientSecret);
        setCurrentOrderId(orderId);
        setCardStep("form");
        return;
      }

      if (paymentMethod === "paypal") {
        const sessionRes = await axios.post(
          "/api/v1/payments/create-session",
          {
            paymentMethod: "paypal",
            amount: total,
            currency: store.currency || "USD",
            orderId,
            items: cartItems.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
            shippingInfo,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (sessionRes.data.success && sessionRes.data.checkoutUrl) {
          window.location.href = sessionRes.data.checkoutUrl;
        } else {
          toast.error("PayPal is not configured");
        }
        return;
      }

      if (paymentMethod === "tabby" || paymentMethod === "tamara") {
        const sessionRes = await axios.post(
          "/api/v1/payments/create-session",
          {
            paymentMethod,
            amount: total,
            currency: store.currency || "USD",
            orderId,
            items: cartItems.map((i) => ({ title: i.title, quantity: i.quantity, price: i.price })),
            shippingInfo,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (sessionRes.data.success && sessionRes.data.checkoutUrl) {
          window.location.href = sessionRes.data.checkoutUrl;
        } else {
          toast.error(`${paymentMethod === "tabby" ? "Tabby" : "Tamara"} is not configured`);
        }
        return;
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setCheckingOut(false);
    }
  };

  const handleCardSuccess = async (paymentIntentId) => {
    try {
      await axios.post(
        "/api/v1/payments/confirm",
        { paymentMethod: "credit_card", orderId: currentOrderId, paymentId: paymentIntentId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCartItems([]);
      window.dispatchEvent(new Event("cartUpdated"));
      setShowCheckout(false);
      setCardStep(null);
      setClientSecret(null);
      setCurrentOrderId(null);
      navigate("/");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  if (!token) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="text-6xl mb-2">🔒</div>
        <h2 className="text-2xl font-bold opacity-50">Please login to view your cart</h2>
        <Link to="/login" className="btn btn-primary rounded-xl px-8">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 px-4">
        <div className="text-6xl mb-2">🛒</div>
        <h2 className="text-2xl font-bold opacity-50">Your cart is empty</h2>
        <Link to="/" className="btn btn-primary rounded-xl px-8">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black mb-8 uppercase tracking-tighter">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          {cartItems.map((item, idx) => (
            <div key={item.productId || item.id || idx} className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden rounded-3xl p-4 flex flex-col sm:flex-row gap-4">
              <figure className="w-full sm:w-32 h-48 sm:h-32 shrink-0">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded-2xl" />
              </figure>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <h2 className="card-title text-lg md:text-xl font-bold truncate">{item.title}</h2>
                    <p className="text-xs md:text-sm opacity-50 font-medium uppercase">Category</p>
                  </div>
                  <p className="text-base md:text-xl font-black text-primary shrink-0">{formatPrice(item.price, store.currency)}</p>
                </div>
                <div className="card-actions justify-between items-center mt-4 flex-wrap">
                  <div className="join border border-base-300 rounded-xl">
                    <button className="btn btn-ghost btn-sm join-item" onClick={() => adjustQty(item.productId, -1)}>-</button>
                    <span className="px-4 flex items-center font-bold text-sm">{item.quantity}</span>
                    <button className="btn btn-ghost btn-sm join-item" onClick={() => adjustQty(item.productId, 1)}>+</button>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="btn btn-ghost btn-sm text-error font-bold hover:bg-error/10">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="card bg-base-100 shadow-2xl border border-base-300 rounded-[2.5rem] p-6 md:p-8 sticky top-24">
            <h3 className="text-lg md:text-xl font-black mb-6 uppercase">Order Summary</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between opacity-70 font-medium text-sm md:text-base">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal, store.currency)}</span>
              </div>
              <div className="flex justify-between opacity-70 font-medium text-sm md:text-base">
                <span>Shipping</span>
                <span className="text-success font-bold uppercase">Free</span>
              </div>
              <div className="flex justify-between opacity-70 font-medium text-sm md:text-base">
                <span>VAT ({store.taxRate}%)</span>
                <span>{formatPrice(vat, store.currency)}</span>
              </div>
              <div className="divider"></div>
              <div className="flex justify-between items-center gap-2">
                <span className="text-base md:text-lg font-bold shrink-0">Total</span>
                <span className="text-base sm:text-lg md:text-3xl font-black text-primary text-right">{formatPrice(total, store.currency)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowCheckout(true)}
              className="btn btn-primary btn-block btn-lg rounded-2xl font-black text-lg shadow-lg"
            >
              Proceed to Checkout
            </button>
            <p className="text-[10px] text-center mt-4 opacity-40 font-bold uppercase tracking-widest">
              Secure Checkout • Fast Delivery
            </p>
          </div>
        </div>
      </div>

      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-base-100 rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-base-100 p-4 border-b border-base-300 flex justify-between items-center">
              <h3 className="text-lg md:text-xl font-bold">
                {cardStep === "form" ? "Card Payment" : "Checkout"}
              </h3>
              <button
                onClick={() => {
                  setShowCheckout(false);
                  setCardStep(null);
                  setClientSecret(null);
                  setCurrentOrderId(null);
                }}
                className="btn btn-ghost btn-sm btn-circle"
              >✕</button>
            </div>

            {cardStep === "form" && clientSecret && stripePromise ? (
              <div className="p-4">
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripeCardForm
                    total={total}
                    currency={store.currency || "USD"}
                    clientSecret={clientSecret}
                    orderId={currentOrderId}
                    onSuccess={handleCardSuccess}
                  />
                </Elements>
              </div>
            ) : cardStep === "creating" ? (
              <div className="p-10 flex flex-col items-center justify-center space-y-4">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <p className="font-bold opacity-60">Preparing card payment...</p>
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="p-4 space-y-4">
                <div className="form-control">
                  <label className="label"><span className="label-text font-bold">Address</span></label>
                  <input type="text" required value={shippingInfo.address}
                    onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    className="input input-bordered rounded-xl" placeholder="Street, building..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-bold">City</span></label>
                    <input type="text" required value={shippingInfo.city}
                      onChange={e => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      className="input input-bordered rounded-xl" placeholder="Riyadh" />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-bold">Country</span></label>
                    <input type="text" required value={shippingInfo.country}
                      onChange={e => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      className="input input-bordered rounded-xl" placeholder="Saudi Arabia" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label"><span className="label-text font-bold">ZIP Code</span></label>
                    <input type="text" required value={shippingInfo.zipCode}
                      onChange={e => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                      className="input input-bordered rounded-xl" />
                  </div>
                  <div className="form-control">
                    <label className="label"><span className="label-text font-bold">Mobile No.</span></label>
                    <input type="tel" required value={shippingInfo.mobileNo}
                      onChange={e => setShippingInfo({ ...shippingInfo, mobileNo: e.target.value })}
                      className="input input-bordered rounded-xl" placeholder="+966" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="label"><span className="label-text font-bold">Payment Method</span></label>
                  {paymentMethods.map((pm) => (
                    <label
                      key={pm.id}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === pm.id
                          ? "border-primary bg-primary/5"
                          : "border-base-300 hover:border-base-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={pm.id}
                        checked={paymentMethod === pm.id}
                        onChange={() => setPaymentMethod(pm.id)}
                        className="radio radio-primary radio-sm"
                      />
                      <span className="text-xl">{pm.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm">{pm.name}</p>
                        <p className="text-xs opacity-60">{pm.description}</p>
                      </div>
                      {paymentMethod === pm.id && (
                        <span className="badge badge-primary badge-sm">Selected</span>
                      )}
                    </label>
                  ))}
                </div>

                <div className="bg-base-200 rounded-xl p-4">
                  <h4 className="font-bold mb-2">Order Summary</h4>
                  {cartItems.map((item, idx) => (
                    <div key={item.productId || item.id || idx} className="flex justify-between text-sm py-1">
                      <span>{item.title} x{item.quantity}</span>
                      <span className="font-bold">{formatPrice(item.price * item.quantity, store.currency)}</span>
                    </div>
                  ))}
                  <div className="divider my-2"></div>
                  <div className="flex justify-between font-black text-lg">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total, store.currency)}</span>
                  </div>
                  {paymentMethod !== "cod" && (
                    <p className="text-xs text-center mt-2 opacity-60">
                      You will be redirected to complete payment
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={checkingOut}
                  className="btn btn-primary btn-block btn-lg rounded-2xl font-black text-lg shadow-lg"
                >
                  {checkingOut ? (
                    <><span className="loading loading-spinner loading-sm mr-2"></span>Processing...</>
                  ) : (
                    `Pay with ${paymentMethods.find((p) => p.id === paymentMethod)?.name || "Credit Card"} — ${formatPrice(total, store.currency)}`
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
