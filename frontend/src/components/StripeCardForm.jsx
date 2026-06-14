import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { formatPrice } from "../utils/currency";
import { toast } from "react-toastify";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-base-200 rounded-xl p-4">
        <label className="label">
          <span className="label-text font-bold">Card Details</span>
        </label>
        <div className="bg-white rounded-lg p-3 border border-base-300">
          <CardElement options={CARD_OPTIONS} />
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
