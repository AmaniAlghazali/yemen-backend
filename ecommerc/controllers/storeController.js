import { prisma } from "../db/conn.js";

export const getStoreSettings = async (req, res) => {
  try {
    let store = await prisma.store.findFirst();
    if (!store) {
      store = await prisma.store.create({ data: {} });
    }
    res.status(200).json({
      success: true,
      store,
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStoreSettings = async (req, res) => {
  try {
    const { storeName, currency, taxRate, maintenanceMode } = req.body;

    let store = await prisma.store.findFirst();
    if (!store) {
      store = await prisma.store.create({ data: {} });
    }

    const updateData = {};
    if (storeName !== undefined) updateData.storeName = storeName;
    if (currency !== undefined) updateData.currency = currency;
    if (taxRate !== undefined) updateData.taxRate = Number(taxRate);
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;

    const updated = await prisma.store.update({
      where: { id: store.id },
      data: updateData,
    });

    res.status(200).json({
      success: true,
      message: "Store settings updated successfully",
      store: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
