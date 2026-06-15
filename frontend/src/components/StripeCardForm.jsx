import { useState } from "react";
import axios from "axios";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
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

const INPUT_STYLE = {
  base: {
    fontSize: "16px",
    color: "#0f172a",
    "::placeholder": { color: "#94a3b8" },
    fontFamily: "inherit",
  },
  invalid: { color: "#ef4444" },
};

const StripeCardForm = ({ total, currency, clientSecret, orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [saveCard, setSaveCard] = useState(false);
  const [cardBrand, setCardBrand] = useState("unknown");

  const handleBrandChange = (event) => {
    setCardBrand(event.brand || "unknown");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {},
      },
      setup_future_usage: saveCard ? "off_session" : undefined,
    });

    if (error) {
      toast.error(error.message);
      setProcessing(false);
      return;
    }

    if (paymentIntent.status === "succeeded") {
      if (saveCard) {
        try {
          await axios.post(
            "/api/v1/payments/save-payment-method",
            { paymentMethodId: paymentIntent.payment_method },
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } },
          );
          toast.success("Card saved for future payments!");
        } catch {
          toast.warn("Payment succeeded, but could not save card");
        }
      } else {
        toast.success("Payment successful!");
      }
      onSuccess(paymentIntent.id);
    }
  };

  const brand = BRANDS[cardBrand] || BRANDS.unknown;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-base-200 rounded-xl p-4 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="label-text font-bold">Card Number</label>
            <span className={`text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md ${brand.color}`}>
              {brand.label}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-base-300">
            <CardNumberElement options={{ style: INPUT_STYLE }} onChange={handleBrandChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text font-bold mb-1 block">Expiry Date</label>
            <div className="bg-white rounded-lg p-3 border border-base-300">
              <CardExpiryElement options={{ style: INPUT_STYLE }} />
            </div>
          </div>
          <div>
            <label className="label-text font-bold mb-1 block">CVV</label>
            <div className="bg-white rounded-lg p-3 border border-base-300">
              <CardCvcElement options={{ style: INPUT_STYLE }} />
            </div>
          </div>
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
