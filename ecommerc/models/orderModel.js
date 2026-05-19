import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    shippingInfo: {
      address: {
        type: String,
        required: true,
      },
      mobileNo: {
        type: Number,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      zipCode: {
        type: Number,
        required: true,
      },
    },

    orderItems: [
      {
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: { type: Number, required: true },
        image: {
          type: String,
          required: true,
        },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
      },
    ],
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentInfo: {
      id: {
        type: String,
        required: true,
      },
      status: {
        type: String,
        required: true,
      },
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
    },
    orderStatus: {
      type: String,
      required: true,
      default: "Processing",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paidAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
