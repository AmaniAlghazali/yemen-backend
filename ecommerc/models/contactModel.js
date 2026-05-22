import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
  },
  subject: {
    type: String,
    default: "Order Inquiry",
  },
  message: {
    type: String,
    required: [true, "Message is required"],
  },
  location: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, {
  timestamps: true,
});

const ContactMessage = mongoose.model("ContactMessage", contactSchema);
export default ContactMessage;