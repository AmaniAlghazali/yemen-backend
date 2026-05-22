import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: "Yemen Marketplace",
  },
  currency: {
    type: String,
    default: "USD",
  },
  taxRate: {
    type: Number,
    default: 5,
  },
  maintenanceMode: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Store = mongoose.model("Store", storeSchema);

export default Store;
