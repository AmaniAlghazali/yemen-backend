import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const ViewAllOrders = () => {
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
        "http://localhost:8000/api/v1/orders/all-orders",
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
        "http://localhost:8000/api/v1/products/get-all-products",
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

    const firstItem = order.orderItems?.[0];

    if (
      firstItem?.image &&
      typeof firstItem.image === "string" &&
      !firstItem.image.includes("[object Object]")
    ) {
      currentImage = firstItem.image;
    }

    setEditingOrderId(order._id);

    setEditOrderFormData({
      address: order.shippingInfo?.address || "",
      mobileNo: order.shippingInfo?.mobileNo || "",
      city: order.shippingInfo?.city || "",
      country: order.shippingInfo?.country || "",
      zipCode: order.shippingInfo?.zipCode || "",
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
        `http://localhost:8000/api/v1/orders/update-order-element/${editingOrderId}`,
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
          order._id === editingOrderId
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
        (p) => p._id === newOrder.productId,
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

      const formData = new FormData();

      formData.append("address", newOrder.address);
      formData.append("mobileNo", newOrder.mobileNo);
      formData.append("city", newOrder.city);
      formData.append("country", newOrder.country);
      formData.append("zipCode", newOrder.zipCode);
      formData.append("productName", newOrder.productName);
      formData.append("productPrice", newOrder.productPrice);
      formData.append("quantity", newOrder.quantity);
      formData.append("productId", newOrder.productId);
      formData.append("paymentId", newOrder.paymentId);
      formData.append("paymentStatus", newOrder.paymentStatus);
      formData.append("taxPrice", newOrder.taxPrice);
      formData.append("shippingCost", newOrder.shippingCost);
      formData.append("totalPrice", newOrder.totalPrice);
      formData.append("orderStatus", newOrder.orderStatus);
      formData.append("fallbackImageUrl", fallbackImgUrl);

      if (newOrderImageFile) {
        formData.append("image", newOrderImageFile);
      }

      const response = await axios.post(
        "http://localhost:8000/api/v1/orders/create-order",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
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
        `http://localhost:8000/api/v1/orders/update-order-status/${id}`,
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
          order._id === id ? { ...order, orderStatus: status } : order,
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
        `http://localhost:8000/api/v1/orders/delete-order/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        },
      );

      setOrders((prev) => prev.filter((order) => order._id !== id));

      alert("Order Deleted");
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  return (
    <>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-base-100 p-4 md:p-6 rounded-2xl shadow-sm border border-base-300 mb-5">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg md:text-xl font-bold text-base-content tracking-tight">
            Orders Dashboard
          </h2>

          <p className="text-xs md:text-sm text-base-content/60 mt-0.5">
            Manage all orders and shipping details
          </p>
        </div>

        <Link
          to="/admin"
          className="btn btn-neutral btn-sm rounded-lg gap-2 w-full sm:w-auto h-10 shrink-0"
        >
          Back
        </Link>
      </div>

      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
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
                      (p) => p._id === e.target.value,
                    );

                    if (selectedProduct) {
                      setNewOrder({
                        ...newOrder,
                        productId: selectedProduct._id,
                        productName:
                          selectedProduct.name || selectedProduct.title,
                        productPrice: selectedProduct.price,
                      });
                    }
                  }}
                >
                  <option value="">Select Product</option>

                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
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
                key={order._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden"
              >
                <div className="bg-black text-white p-4 flex justify-between items-center">
                  <div>
                    <h2 className="font-bold">Order ID</h2>

                    <p className="text-sm text-gray-300">{order._id}</p>
                  </div>

                  <span className="badge badge-primary">
                    {order.orderStatus}
                  </span>
                </div>

                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* PRODUCTS */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Products</h3>

                    {order.orderItems?.map((item) => (
                      <div
                        key={item._id}
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
                            ${item.price}
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
                        <b>Address:</b> {order.shippingInfo?.address}
                      </p>

                      <p>
                        <b>City:</b> {order.shippingInfo?.city}
                      </p>

                      <p>
                        <b>Country:</b> {order.shippingInfo?.country}
                      </p>

                      <p>
                        <b>Zip:</b> {order.shippingInfo?.zipCode}
                      </p>

                      <p>
                        <b>Mobile:</b> {order.shippingInfo?.mobileNo}
                      </p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div>
                    <h3 className="font-bold text-lg mb-4">Pricing</h3>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Tax</span>
                        <span>${order.taxPrice}</span>
                      </div>

                      <div className="flex justify-between">
                        <span>Shipping</span>
                        <span>${order.shippingCost}</span>
                      </div>

                      <div className="flex justify-between font-bold text-lg">
                        <span>Total</span>
                        <span className="text-green-600">
                          ${order.totalPrice}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mt-5">
                        <select
                          className="select select-bordered"
                          value={order.orderStatus}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
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
                          onClick={() => deleteOrder(order._id)}
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
        </div>
      </div>
    </>
  );
};

export default ViewAllOrders;
