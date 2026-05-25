import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import { formatPrice } from "../../utils/currency";
import AdminLayout from "../../components/AdminLayout";

const API_URL = "/api/v1";
const toast = {
  success: (msg) => alert(`Success: ${msg}`),
  error: (msg) => alert(`Error: ${msg}`),
};

const ViewAllProduct = () => {
  const { store } = useStore();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Loading and Stats States
  const [isLoading, setIsLoading] = useState(false);
  const [productStats, setProductStats] = useState({ total: 0, lowStock: 0 });

  // Product States
  const [products, setProducts] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState("");
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Search Query State
  const [searchQuery, setSearchQuery] = useState("");

  const CATEGORY_OPTIONS = [
    "Electronics", "Clothing", "Food", "Books",
    "Home & Kitchen", "Beauty", "Sports", "Automotive",
    "Toys & Games", "Health", "Pet Supplies", "Office Supplies",
    "Baby & Kids", "Jewelry", "Music", "Arts & Crafts",
    "Garden", "Tools", "Shoes", "Bags & Luggage",
    "Furniture", "Groceries", "Phones & Tablets",
    "Computers & Laptops", "Cameras", "Smart Home", "Stationery",
  ];

  const [productFormData, setProductFormData] = useState({
    title: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  // Get Auth Token Helpers
  const getToken = useCallback(() => localStorage.getItem("token"), []);
  const getAuthHeader = useCallback(
    () => ({ headers: { Authorization: `Bearer ${getToken()}` } }),
    [getToken],
  );

  // FETCH FUNCTIONS
  const fetchProducts = useCallback(async () => {
    try {
      const res = await axios.get(
        `${API_URL}/products/get-all-products`,
        getAuthHeader(),
      );
      if (res.data.success) {
        setProducts(res.data.products || []);
        setProductStats({
          total: res.data.count || res.data.products?.length || 0,
          lowStock: (res.data.products || []).filter((p) => p.stock < 20)
            .length,
        });
      }
    } catch (error) {
      console.log(error);
    }
  }, [getAuthHeader]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts()]);
      setIsLoading(false);
    };
    loadData();
  }, [fetchProducts]);

  // PRODUCT HANDLERS
  const handleProductInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setImages(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setProductFormData({
        ...productFormData,
        [name]: value,
      });
    }
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: productFormData.title,
        description: productFormData.description,
        price: productFormData.price,
        stock: productFormData.stock,
        category: productFormData.category,
      };

      if (images && !Array.isArray(images)) {
        payload.image = await fileToBase64(images);
      }

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        withCredentials: true,
      };

      if (editingProduct) {
        await axios.put(
          `${API_URL}/products/update-product/${editingProduct.id}`,
          payload,
          config,
        );
        toast.success("Product Updated");
      } else {
        await axios.post(`${API_URL}/products/create-product`, payload, config);
        toast.success("Product Added");
      }

      fetchProducts();
      closeProductModal();
    } catch (error) {
      console.log(error.response?.data || error.message);
    }
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
    setProductFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
    setImages([]);
    setImagePreview("");
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductFormData({
      title: "",
      description: "",
      price: "",
      stock: "",
      category: "",
    });
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category || "",
    });
    if (product.images && product.images.length > 0) {
      setImagePreview(product.images[0].url);
    } else {
      setImagePreview("");
    }
    setIsProductModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await axios.delete(
          `${API_URL}/products/delete-product/${productId}`,
          getAuthHeader(),
        );
        if (res.data.success) {
          toast.success("Product deleted!");
          await fetchProducts();
        }
      } catch (error) {
        toast.error("Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const titleMatch = product.title
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    const categoryMatch = product.category
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
    return titleMatch || categoryMatch;
  });

  return (
    <AdminLayout title="Products Management">
          {/* SEARCH AND CALL TO ACTION CONTROLS */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 bg-base-100 p-4 rounded-2xl shadow-sm border border-base-300">
            <div className="w-full sm:w-72 relative">
              <input
                type="text"
                placeholder="Search products or categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input input-bordered w-full rounded-xl pl-10"
              />
              <svg
                className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <button
              onClick={handleAddProduct}
              className="btn btn-primary rounded-xl gap-2 shadow-md shadow-primary/20"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Product
            </button>
          </div>

          {/* DASHBOARD STATS SUBHEADER PANELS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-300 flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm font-medium">
                  Total Products
                </p>
                <p className="text-3xl font-extrabold mt-1">
                  {productStats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
            <div className="bg-base-100 p-5 rounded-2xl shadow-sm border border-base-300 flex items-center justify-between">
              <div>
                <p className="text-base-content/60 text-sm font-medium">
                  Low Stock Items
                </p>
                <p className="text-3xl font-extrabold text-error mt-1">
                  {productStats.lowStock}
                </p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-error/10 text-error flex items-center justify-center">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* PRODUCTS DATA-TABLE */}
          <div className="bg-base-100 rounded-2xl shadow-sm border border-base-300 overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="table w-full">
                <thead className="bg-base-300/40 text-base-content/80">
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th className="hidden md:table-cell">Description</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-base-300">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan="5"
                        className="text-center text-base-content/50 py-10 font-medium"
                      >
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-base-200/40 transition-colors"
                      >
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="avatar">
                              <div className="w-12 h-12 rounded-xl bg-base-300 border border-base-300 overflow-hidden shadow-inner">
                                {product.images?.[0]?.url ? (
                                  <img
                                    src={product.images[0].url}
                                    alt={product.title}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-base-300 flex items-center justify-center text-xs opacity-40">
                                    No Img
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 max-w-[140px] sm:max-w-none">
                              <div className="font-bold text-base-content truncate">
                                {product.title}
                              </div>
                              <div className="text-xs opacity-60 capitalize font-medium mt-0.5">
                                {product.category}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="font-semibold text-base-content">
                          {formatPrice(product.price, store.currency)}
                        </td>
                        <td>
                          <span
                            className={`badge font-bold px-2.5 py-1 rounded-md ${product.stock < 20 ? "badge-error" : "badge-success"}`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="hidden md:table-cell max-w-xs truncate text-base-content/70">
                          {product.description || (
                            <span className="opacity-30 italic">
                              No description
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditProduct(product)}
                              className="btn btn-sm btn-primary rounded-lg text-xs font-bold"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product.id)}
                              className="btn btn-sm btn-error btn-outline rounded-lg text-xs font-bold"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      {/* PRODUCT DIALOG MANAGEMENT MODAL POPUP */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-base-300 transform transition-all">
            <div className="flex justify-between items-center border-b border-base-300 pb-3 mb-4">
              <h3 className="text-xl font-extrabold text-base-content">
                {editingProduct ? "Edit Product Details" : "Create New Product"}
              </h3>
              <button
                type="button"
                onClick={closeProductModal}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/80">
                    Product Title
                  </span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={productFormData.title}
                  onChange={handleProductInputChange}
                  className="input input-bordered w-full rounded-xl"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/80">
                    Description
                  </span>
                </label>
                <textarea
                  name="description"
                  value={productFormData.description}
                  onChange={handleProductInputChange}
                  className="textarea textarea-bordered w-full rounded-xl"
                  rows="3"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-base-content/80">
                      Price
                    </span>
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={productFormData.price}
                    onChange={handleProductInputChange}
                    className="input input-bordered w-full rounded-xl"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text font-semibold text-base-content/80">
                      Stock Units
                    </span>
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={productFormData.stock}
                    onChange={handleProductInputChange}
                    className="input input-bordered w-full rounded-xl"
                    required
                  />
                </div>
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/80">
                    Category
                  </span>
                </label>
                <select
                  name="category"
                  value={productFormData.category}
                  onChange={handleProductInputChange}
                  className="select select-bordered w-full rounded-xl capitalize"
                  required
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-base-content/80">
                    Product Image Asset
                  </span>
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleProductInputChange}
                  className="file-input file-input-bordered w-full rounded-xl"
                />
              </div>

              {imagePreview && (
                <div className="relative w-28 h-28 mx-auto border border-base-300 rounded-2xl overflow-hidden group shadow-inner bg-base-200 mt-2">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImages([]);
                      setImagePreview("");
                    }}
                    className="absolute top-1 right-1 bg-error text-error-content hover:bg-error-active w-6 h-6 rounded-full flex items-center justify-center text-xs shadow transition-colors"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-base-300 mt-6">
                <button
                  type="button"
                  onClick={closeProductModal}
                  className="btn btn-ghost flex-1 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1 rounded-xl shadow-md"
                >
                  {editingProduct ? "Save Changes" : "Add Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ViewAllProduct;
