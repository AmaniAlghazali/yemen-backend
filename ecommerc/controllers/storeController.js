import Store from "../models/storeModel.js";

export const getStoreSettings = async (req, res) => {
  try {
    let store = await Store.findOne();
    if (!store) {
      store = await Store.create({});
    }
    res.status(200).json({ success: true, store });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreSettings = async (req, res) => {
  try {
    const { storeName, currency, taxRate, maintenanceMode } = req.body;

    let store = await Store.findOne();
    if (!store) {
      store = new Store({});
    }

    if (storeName !== undefined) store.storeName = storeName;
    if (currency !== undefined) store.currency = currency;
    if (taxRate !== undefined) store.taxRate = taxRate;
    if (maintenanceMode !== undefined) store.maintenanceMode = maintenanceMode;

    await store.save();

    res.status(200).json({
      success: true,
      message: "Store settings updated successfully",
      store,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
