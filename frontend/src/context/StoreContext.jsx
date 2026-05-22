import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const StoreContext = createContext(null);

export const StoreProvider = ({ children }) => {
  const [store, setStore] = useState({
    storeName: "DARAZ",
    currency: "SAR",
    taxRate: 15,
    maintenanceMode: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const res = await axios.get("/api/v1/store/settings", { timeout: 3000 });
        if (res.data.success && res.data.store) {
          setStore({
            storeName: res.data.store.storeName || "DARAZ",
            currency: res.data.store.currency || "SAR",
            taxRate: res.data.store.taxRate ?? 15,
            maintenanceMode: res.data.store.maintenanceMode || false,
          });
        }
      } catch {
        console.warn("Could not load store settings, using defaults");
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  return (
    <StoreContext.Provider value={{ store, loading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within StoreProvider");
  return context;
};
