import axios from "axios";
import { useEffect, useState, useCallback } from "react";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../utils/currency";
import AdminLayout from "../../components/AdminLayout";

const ViewAllOrders = () => {
  const { store } = useStore();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddOrder, setShowAddOrder] = useState(false);

  const token = localStorage.getItem("token");

  // ================= EDIT STATES =================
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editImageFile, setEditImageFile] = useState(null);

  const [editOrderFormData, setEditOrderFormData] = useState({
    address: "",
    mobileNo: "",
    city: "",
    country: "",
    zipCode: "",
    taxPrice: "",
    shippingCost: "",
    totalPrice: "",
    image: "",
  });

  // ================= CREATE ORDER STATES =================
  const [newOrderImageFile, setNewOrderImageFile] = useState(null);

  const [newOrder, setNewOrder] = useState({
    address: "",
    mobileNo: "",
    city: "",
    country: "",
    zipCode: "",
    productName: "",
    productPrice: "",
    quantity: "",
    productId: "",
    paymentId: "",
    paymentStatus: "succeeded",
    taxPrice: "",
    shippingCost: "",
    totalPrice: "",
    orderStatus: "Processing",
  });

  // ================= FETCH ORDERS =================
  const getAllOrders = useCallback(async () => {
    try {
      const response = await axios.get(
        "/api/v1/orders/all-orders",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      setOrders(response.data.orders || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  }, [token]);

  // ================= FETCH PRODUCTS =================
  const getProducts = useCallback(async () => {
    try {
      const res = await axios.get(
        "/api/v1/products/get-all-products",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setProducts(res.data.products || []);
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  }, [token]);

  useEffect(() => {
    getAllOrders();
    getProducts();
  }, [getAllOrders, getProducts]);

  // ================= OPEN EDIT MODAL =================
  const openEditModal = (order) => {
    let currentImage = "https://placehold.co/400";

    const firstItem = order.items?.[0];

    if (
      firstItem?.image &&
      typeof firstItem.image === "string" &&
      !firstItem.image.includes("[object Object]")
    ) {
      currentImage = firstItem.image;
    }

    setEditingOrderId(order.id);

    setEditOrderFormData({
      address: order.shippingAddress || "",
      mobileNo: order.shippingMobileNo || "",
      city: order.shippingCity || "",
      country: order.shippingCountry || "",
      zipCode: order.shippingZipCode || "",
      taxPrice: order.taxPrice || "",
      shippingCost: order.shippingCost || "",
      totalPrice: order.totalPrice || "",
      image: currentImage,
    });

    setEditImageFile(null);
    setIsEditModalOpen(true);
  };

  // ================= UPDATE ORDER =================
  const updateOrderDetails = async () => {
    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("address", editOrderFormData.address);
      formData.append("mobileNo", editOrderFormData.mobileNo);
      formData.append("city", editOrderFormData.city);
      formData.append("country", editOrderFormData.country);
      formData.append("zipCode", editOrderFormData.zipCode);
      formData.append("taxPrice", editOrderFormData.taxPrice);
      formData.append("shippingCost", editOrderFormData.shippingCost);
      formData.append("totalPrice", editOrderFormData.totalPrice);

      if (editImageFile) {
        formData.append("image", editImageFile);
      } else {
        formData.append("existingImageUrl", editOrderFormData.image);
      }

      const response = await axios.put(
        `/api/v1/orders/update-order-element/${editingOrderId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === editingOrderId
            ? { ...order, ...response.data.order }
            : order,
        ),
      );

      alert("Order Updated Successfully!");

      setIsEditModalOpen(false);
      setEditingOrderId(null);
      setEditImageFile(null);
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Failed to update order details.");
    } finally {
      setLoading(false);
    }
  };

  // ================= CREATE ORDER =================
  const createOrder = async () => {
    try {
      setLoading(true);

      const selectedProduct = products.find(
        (p) => p.id === newOrder.productId,
      );

      if (!selectedProduct) {
        alert("Please select a product");
        return;
      }

      let fallbackImgUrl = "https://placehold.co/400";

      if (selectedProduct.images?.[0]?.url) {
        fallbackImgUrl = selectedProduct.images[0].url;
      } else if (typeof selectedProduct.image === "string") {
        fallbackImgUrl = selectedProduct.image;
      }

      const body = {
        shippingInfo: {
          address: newOrder.address,
          mobileNo: newOrder.mobileNo,
          city: newOrder.city,
          country: newOrder.country,
          zipCode: newOrder.zipCode,
        },
        items: [
          {
            productId: newOrder.productId,
            title: newOrder.productName,
            price: Number(newOrder.productPrice),
            quantity: Number(newOrder.quantity),
            image: fallbackImgUrl,
          },
        ],
        paymentId: newOrder.paymentId,
        paymentStatus: newOrder.paymentStatus,
        taxPrice: Number(newOrder.taxPrice),
        shippingCost: Number(newOrder.shippingCost),
        totalPrice: Number(newOrder.totalPrice),
        orderStatus: newOrder.orderStatus,
      };

      const response = await axios.post(
        "/api/v1/orders/create-order",
        body,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      setOrders([...orders, response.data.order]);

      alert("Order Created Successfully!");

      setShowAddOrder(false);
      setNewOrderImageFile(null);

      setNewOrder({
        address: "",
        mobileNo: "",
        city: "",
        country: "",
        zipCode: "",
        productName: "",
        productPrice: "",
        quantity: "",
        productId: "",
        paymentId: "",
        paymentStatus: "succeeded",
        taxPrice: "",
        shippingCost: "",
        totalPrice: "",
        orderStatus: "Processing",
      });
    } catch (error) {
      console.log(error.response?.data || error.message);
      alert("Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  // ================= UPDATE STATUS =================
  const updateOrderStatus = async (id, status) => {
    try {
      await axios.put(
        `/api/v1/orders/update-order-status/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      setOrders((prev) =>
        prev.map((order) =>
          order.id === id ? { ...order, orderStatus: status } : order,
        ),
      );

      alert("Order Status Updated");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  // ================= DELETE ORDER =================
  const deleteOrder = async (id) => {
    try {
      await axios.delete(
        `/api/v1/orders/delete-order/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      setOrders((prev) => prev.filter((order) => order.id !== id));

      alert("Order Deleted");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <AdminLayout title="Orders Management">
          {/* TOP */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-3xl font-bold text-gray-800">All Orders</h1>

            <div className="flex gap-3">
              <div className="bg-black text-white px-4 py-2 rounded-xl">
                Total: {orders.length}
              </div>

              <button
                onClick={() => setShowAddOrder(!showAddOrder)}
                className="btn btn-success"
              >
                {showAddOrder ? "Close" : "+ Add Order"}
              </button>
            </div>
          </div>

          {/* CREATE ORDER */}
          {showAddOrder && (
            <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
              <h2 className="text-2xl font-bold mb-6">Create Order</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <input
                  type="text"
                  placeholder="Address"
                  className="input input-bordered w-full"
                  value={newOrder.address}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      address: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Mobile"
                  className="input input-bordered w-full"
                  value={newOrder.mobileNo}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      mobileNo: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="City"
                  className="input input-bordered w-full"
                  value={newOrder.city}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      city: e.target.value,
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Country"
                  className="input input-bordered w-full"
                  value={newOrder.country}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      country: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Zip Code"
                  className="input input-bordered w-full"
                  value={newOrder.zipCode}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      zipCode: e.target.value,
                    })
                  }
                />

                <select
                  className="select select-bordered w-full"
                  value={newOrder.productId}
                  onChange={(e) => {
                    const selectedProduct = products.find(
                      (p) => p.id === e.target.value,
                    );

                    if (selectedProduct) {
                      setNewOrder({
                        ...newOrder,
                        productId: selectedProduct.id,
                        productName:
                          selectedProduct.name || selectedProduct.title,
                        productPrice: selectedProduct.price,
                      });
                    }
                  }}
                >
                  <option value="">Select Product</option>

                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name || p.title}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Price"
                  className="input input-bordered w-full"
                  value={newOrder.productPrice}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      productPrice: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Quantity"
                  className="input input-bordered w-full"
                  value={newOrder.quantity}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      quantity: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Tax"
                  className="input input-bordered w-full"
                  value={newOrder.taxPrice}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      taxPrice: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Shipping"
                  className="input input-bordered w-full"
                  value={newOrder.shippingCost}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      shippingCost: e.target.value,
                    })
                  }
                />

                <input
                  type="number"
                  placeholder="Total"
                  className="input input-bordered w-full"
                  value={newOrder.totalPrice}
                  onChange={(e) =>
                    setNewOrder({
                      ...newOrder,
                      totalPrice: e.target.value,
                    })
                  }
                />

                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered w-full"
                  onChange={(e) => setNewOrderImageFile(e.target.files[0])}
                />
              </div>

              <button
                onClick={createOrder}
                className="btn btn-success mt-6"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Order"}
              </button>
            </div>
          )}

          {/* ORDERS */}
          <div className="grid gap-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-black text-white p-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold">Order ID</h2>

                    <p className="text-sm text-gray-300">{order.id}</p>
                  </div>

                  <span className="badge badge-primary">
                    {order.orderStatus}
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* PRODUCTS */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Products</h3>

                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 border rounded-xl p-3 mb-3"
                      >
                        <img
                          src={item.image || "https://placehold.co/400"}
                          alt={item.name}
                          className="w-20 h-20 rounded-lg object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://placehold.co/400";
                          }}
                        />

                        <div>
                          <h4 className="font-semibold">{item.name}</h4>

                          <p>Qty: {item.quantity}</p>

                          <p className="font-bold text-green-600">
                            {formatPrice(item.price, store.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SHIPPING */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Shipping Info</h3>

                    <div className="space-y-2">
                      <p>
                        <b>Address:</b> {order.shippingAddress}
                      </p>

                      <p>
                        <b>City:</b> {order.shippingCity}
                      </p>

                      <p>
                        <b>Country:</b> {order.shippingCountry}
                      </p>

                      <p>
                        <b>Zip:</b> {order.shippingZipCode}
                      </p>

                      <p>
                        <b>Mobile:</b> {order.shippingMobileNo}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Pricing</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>{formatPrice(order.taxPrice, store.currency)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>{formatPrice(order.shippingCost, store.currency)}</span>
                      </div>

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-green-600">
                          {formatPrice(order.totalPrice, store.currency)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-5">
                        <select
                          className="select select-bordered"
                          value={order.orderStatus}
                          onChange={(e) =>
                            updateOrderStatus(order.id, e.target.value)
                          }
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => openEditModal(order)}
                          className="btn btn-warning"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="btn btn-error"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY */}
          {orders.length === 0 && (
            <div className="bg-white rounded-2xl shadow p-10 text-center mt-6">
              <h2 className="text-2xl font-bold text-gray-700">
                No Orders Found
              </h2>

              <p className="text-gray-500 mt-2">
                Orders will appear here once customers place them.
              </p>
            </div>
          )}
    </AdminLayout>
  );
};

export default ViewAllOrders;
