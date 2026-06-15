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

const BRANDS = {
  visa: {
    label: "VISA",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3.5 6.3c-.3.8-1.5 4.2-1.5 4.2s-.2-.5-.4-.9c-.2-.4-.4-.6-.8-.6h-1.2l.8-2.5c.1-.3.3-.5.6-.5h.9c.3 0 .5.2.5.5l-.2.6s.4-.7.7-.9c.3-.1.5-.2.7-.2.4 0 .6.2.6.5 0 .1-.1.3-.2.5l-.5 1.3z",
  },
  mastercard: {
    label: "Mastercard",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-1 11.5c-.7.6-1.6 1-2.5 1-2.2 0-4-1.8-4-4s1.8-4 4-4c.9 0 1.8.3 2.5 1-.7.6-1.2 1.5-1.2 2.5s.5 1.9 1.2 2.5zm2 0c.7-.6 1.2-1.5 1.2-2.5s-.5-1.9-1.2-2.5c.7-.6 1.6-1 2.5-1 2.2 0 4 1.8 4 4s-1.8 4-4 4c-.9 0-1.8-.4-2.5-1z",
  },
  amex: {
    label: "Amex",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-1.5 9.5H9l-1.5-1.5L6 13.5H4.5l2.2-2.2L4.5 9H6l1.5 1.5L9 9h1.5l-2.2 2.3 2.2 2.2zm4 0h-1.5l-1-2.5-1 2.5h-1.5l1.5-3.5-1.5-3.5h1.5l1 2.5 1-2.5h1.5l-1.5 3.5 1.5 3.5z",
  },
  discover: {
    label: "Discover",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm3 10.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zM9 11c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1zm3-1c0-1.1-.9-2-2-2H7v4h3c1.1 0 2-.9 2-2z",
  },
  diners: {
    label: "Diners",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 11c-.6.6-1.3 1-2 1-1.7 0-3-1.3-3-3s1.3-3 3-3c.7 0 1.4.4 2 1-.3.3-.5.8-.5 1.5s.2 1.2.5 1.5zm2-1c0 1.7-1.3 3-3 3-.7 0-1.4-.4-2-1 .3-.3.5-.8.5-1.5s-.2-1.2-.5-1.5c.6-.6 1.3-1 2-1 1.7 0 3 1.3 3 3z",
  },
  jcb: {
    label: "JCB",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm1 10.8c0 .7-.6 1.2-1.2 1.2H9v-6h2.8c.6 0 1.2.5 1.2 1.2v.6c0 .4-.2.7-.5.9.3.2.5.5.5.9v1.2z",
  },
  unionpay: {
    label: "UnionPay",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm2.5 11h-5c-.3 0-.5-.2-.5-.5v-5c0-.3.2-.5.5-.5h5c.3 0 .5.2.5.5v5c0 .3-.2.5-.5.5z",
  },
  mada: {
    label: "MADA",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm-1 10.5L8.5 12 11 9.5 12 10.5l-1.5 1.5L12 13.5l-1 1zm2 0L12 13.5l1.5-1.5L12 10.5l1-1 2.5 2.5-2.5 2.5z",
  },
  unknown: {
    label: "Card",
    icon: "M12 4C7.6 4 4 7.6 4 12s3.6 8 8 8 8-3.6 8-8-3.6-8-8-8zm4 10c0 .6-.4 1-1 1H9c-.6 0-1-.4-1-1v-4c0-.6.4-1 1-1h6c.6 0 1 .4 1 1v4zm-6-3c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1zm4 0c-.6 0-1 .4-1 1s.4 1 1 1 1-.4 1-1-.4-1-1-1z",
  },
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

const PayPalForm = ({ total, currency, clientSecret, orderId, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
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

  const brand = BRANDS[cardBrand] || BRANDS.unknown;

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
            <div className="flex items-center justify-between mb-1">
              <label className="label-text font-bold">Card Number</label>
              <span className="flex items-center gap-1.5 text-xs font-bold tracking-widest uppercase px-2 py-1 rounded-md bg-white border border-base-300">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d={brand.icon} />
                </svg>
                {brand.label}
              </span>
            </div>
            <div className="bg-white rounded-lg p-3 border border-base-300">
              <CardNumberElement options={{ style: INPUT_STYLE }} onChange={handleBrandChange} />
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
