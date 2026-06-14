import { useState } from "react";
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { formatPrice } from "../utils/currency";
import { toast } from "react-toastify";

const INPUT_STYLE = {
  base: {
    fontSize: "16px",
    color: "#0f172a",
    "::placeholder": { color: "#94a3b8" },
    fontFamily: "inherit",
  },
  invalid: { color: "#ef4444" },
};

const PayPalForm = ({ total, currency, clientSecret, orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardNumberElement),
        billing_details: {
          name: `${firstName} ${lastName}`.trim() || undefined,
          email: email || undefined,
          phone: phone || undefined,
          address: {
            country: country || undefined,
          },
        },
      },
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
      <div className="bg-base-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="text-3xl">🅿️</span>
          <div>
            <p className="font-black text-lg">Pay with PayPal</p>
            <p className="text-xs opacity-60">Secure payment via PayPal</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text font-bold mb-1 block">First Name</label>
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input input-bordered w-full rounded-lg bg-white"
              placeholder="John"
            />
          </div>
          <div>
            <label className="label-text font-bold mb-1 block">Last Name</label>
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input input-bordered w-full rounded-lg bg-white"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label className="label-text font-bold mb-1 block">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input input-bordered w-full rounded-lg bg-white"
            placeholder="john@example.com"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-text font-bold mb-1 block">Phone Number</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input input-bordered w-full rounded-lg bg-white"
              placeholder="+966 5X XXX XXXX"
            />
          </div>
          <div>
            <label className="label-text font-bold mb-1 block">Country</label>
            <select
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="select select-bordered w-full rounded-lg bg-white"
            >
              <option value="">Select country</option>
              <option value="SA">Saudi Arabia</option>
              <option value="YE">Yemen</option>
              <option value="AE">United Arab Emirates</option>
              <option value="QA">Qatar</option>
              <option value="KW">Kuwait</option>
              <option value="BH">Bahrain</option>
              <option value="OM">Oman</option>
              <option value="EG">Egypt</option>
              <option value="JO">Jordan</option>
              <option value="US">United States</option>
              <option value="GB">United Kingdom</option>
            </select>
          </div>
        </div>

        <div className="border-t border-base-300 pt-4">
          <p className="font-bold text-sm mb-3">Card Details</p>

          <div>
            <label className="label-text font-bold mb-1 block">Card Number</label>
            <div className="bg-white rounded-lg p-3 border border-base-300">
              <CardNumberElement options={{ style: INPUT_STYLE }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-3">
            <div>
              <label className="label-text font-bold mb-1 block">Expiry Date</label>
              <div className="bg-white rounded-lg p-3 border border-base-300">
                <CardExpiryElement options={{ style: INPUT_STYLE }} />
              </div>
            </div>
            <div>
              <label className="label-text font-bold mb-1 block">CSC</label>
              <div className="bg-white rounded-lg p-3 border border-base-300">
                <CardCvcElement options={{ style: INPUT_STYLE }} />
              </div>
            </div>
          </div>
        </div>
      </div>

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
          `Pay with PayPal — ${formatPrice(total, currency)}`
        )}
      </button>
    </form>
  );
};

export default PayPalForm;
