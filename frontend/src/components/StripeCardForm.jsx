import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { formatPrice } from "../utils/currency";
import { toast } from "react-toastify";

const BRANDS = {
  mada: { label: "MADA", color: "bg-emerald-600 text-white" },
  visa: { label: "VISA", color: "bg-blue-700 text-white" },
  mastercard: { label: "Mastercard", color: "bg-orange-500 text-white" },
  jcb: { label: "JCB", color: "bg-green-600 text-white" },
  amex: { label: "Amex", color: "bg-blue-500 text-white" },
  discover: { label: "Discover", color: "bg-orange-600 text-white" },
  diners: { label: "Diners", color: "bg-indigo-600 text-white" },
  unionpay: { label: "UnionPay", color: "bg-green-700 text-white" },
  unknown: { label: "Card", color: "bg-gray-500 text-white" },
};

const CARD_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#0f172a",
      "::placeholder": { color: "#94a3b8" },
      padding: "12px",
    },
    invalid: { color: "#ef4444" },
  },
  hidePostalCode: true,
};

const StripeCardForm = ({ total, currency, clientSecret, orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [cardBrand, setCardBrand] = useState("unknown");

  const handleChange = (event) => {
    setCardBrand(event.brand || "unknown");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      },
      setup_future_usage: saveCard ? "off_session" : undefined,
    });

    if (error) {
      toast.error(error.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      toast.success("Payment successful!");
      onSuccess(paymentIntent.id);
    }
  };

  const brand = BRANDS[cardBrand] || BRANDS.unknown;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-base-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <label className="label-text font-bold">Card Details</label>
          <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md ${brand.color}`}>
            {brand.label}
          </span>
        </div>
        <div className="bg-white rounded-lg p-3 border border-base-300">
          <CardElement options={CARD_OPTIONS} onChange={handleChange} />
        </div>
      </div>

      <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-base-300 hover:border-base-400 transition-all">
        <input
          type="checkbox"
          checked={saveCard}
          onChange={(e) => setSaveCard(e.target.checked)}
          className="toggle toggle-primary"
        />
        <div>
          <p className="font-bold text-sm">Remember this card for future use</p>
          <p className="text-xs opacity-60">Save card securely for faster checkout</p>
        </div>
      </label>

      <div className="bg-base-200 rounded-xl p-4 flex justify-between items-center">
        <span className="font-bold">Total</span>
        <span className="text-2xl font-black text-primary">{formatPrice(total, currency)}</span>
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="btn btn-primary btn-block btn-lg rounded-2xl font-black text-lg shadow-lg"
      >
        {processing ? (
          <><span className="loading loading-spinner loading-sm mr-2"></span>Processing...</>
        ) : (
          `Place Order — ${formatPrice(total, currency)}`
        )}
      </button>
    </form>
  );
};

export default StripeCardForm;
