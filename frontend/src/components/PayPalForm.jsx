import { useState } from "react";
import { formatPrice } from "../utils/currency";

const PayPalForm = ({ total, currency, onSubmit }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      firstName,
      lastName,
      email,
      phone,
      country,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-base-200 rounded-xl p-4 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">🅿️</span>
          <span className="font-black text-lg">Pay with PayPal</span>
        </div>
        <p className="text-xs opacity-60 -mt-2">
          You'll be redirected to PayPal to complete your payment securely.
        </p>

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
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-base-200 rounded-xl p-4 flex justify-between items-center">
        <span className="font-bold">Total</span>
        <span className="text-2xl font-black text-primary">{formatPrice(total, currency)}</span>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-block btn-lg rounded-2xl font-black text-lg shadow-lg"
      >
        Continue to PayPal — {formatPrice(total, currency)}
      </button>
    </form>
  );
};

export default PayPalForm;
