import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";

const Home = () => {
  // State Management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = ["electronics", "clothing", "food", "books", "accessories"];

  // 1. Fetch Products with Token Authorization
  useEffect(() => {
    const getAllProducts = async () => {
      try {
        setLoading(true);
        // Get the token you saved during login
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:8000/api/v1/products/get-all-products", {
          headers: {
            // This ensures the backend knows who is browsing
            Authorization: token ? `Bearer ${token}` : ""
          }
        });

        if (response.data && response.data.products) {
          setProducts(response.data.products);
        } else if (Array.isArray(response.data)) {
          setProducts(response.data);
        }
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };
    getAllProducts();
  }, []);

  // 2. Optimized Filtering Logic
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.title?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "All" || 
        product.category?.toLowerCase() === selectedCategory.toLowerCase();
      
      const price = Number(product.price);
      const matchesMin = minPrice === "" || price >= Number(minPrice);
      const matchesMax = maxPrice === "" || price <= Number(maxPrice);

      return matchesSearch && matchesCategory && matchesMin && matchesMax;
    });
  }, [products, searchTerm, selectedCategory, minPrice, maxPrice]);

  // 3. Reset Filter Helper
  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="bg-base-100 min-h-screen font-sans">
      {/* Dynamic Carousel */}
      <div className="carousel w-full h-[300px] md:h-[500px] shadow-inner bg-base-300"> 
        {[1, 2, 3, 4].map((num) => (
          <div key={num} id={`slide${num}`} className="carousel-item relative w-full group">
            <img 
              src={`/images/${num}.jpg`} 
              className="w-full object-cover transition-transform duration-700 group-hover:scale-105" 
              alt={`Slide ${num}`} 
            />
            <div className="absolute left-4 right-4 top-1/2 flex -translate-y-1/2 justify-between">
              <a href={`#slide${num === 1 ? 4 : num - 1}`} className="btn btn-circle btn-sm md:btn-md glass">❮</a>
              <a href={`#slide${num === 4 ? 1 : num + 1}`} className="btn btn-circle btn-sm md:btn-md glass">❯</a>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Filters */}
          <aside className="w-full lg:w-1/4 space-y-6">
            <div className="bg-base-200 p-6 rounded-3xl shadow-sm lg:sticky lg:top-8 border border-base-300">
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span> Filters
              </h2>

              <div className="space-y-4">
                {/* Search */}
                <div className="form-control">
                  <label className="label-text font-bold mb-2">Keyword</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search items..."
                      className="input input-bordered w-full pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <span className="absolute left-3 top-3.5 opacity-40">🔍</span>
                  </div>
                </div>

                {/* Category */}
                <div className="form-control">
                  <label className="label-text font-bold mb-2">Category</label>
                  <select 
                    className="select select-bordered w-full capitalize"
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="form-control">
                  <label className="label-text font-bold mb-2">Price Range (SAR)</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      placeholder="Min" 
                      className="input input-bordered input-sm w-full"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                    />
                    <span className="opacity-40">-</span>
                    <input 
                      type="number" 
                      placeholder="Max" 
                      className="input input-bordered input-sm w-full"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                    />
                  </div>
                </div>

                <button 
                  onClick={resetFilters}
                  className="btn btn-outline btn-sm w-full mt-4 rounded-xl"
                >
                  Reset All
                </button>
              </div>
            </div>
          </aside>

          {/* Product Display Area */}
          <main className="w-full lg:w-3/4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className='text-3xl md:text-5xl font-black text-base-content'>Our Collection</h1>
                <p className="text-base-content/60 mt-2">
                  Showing {filteredProducts.length} items found in Riyadh
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center bg-base-200 rounded-3xl border-2 border-dashed border-base-300">
                    <p className="text-5xl mb-4">📦</p>
                    <p className="text-xl font-bold opacity-40">No items match your filters.</p>
                    <button onClick={resetFilters} className="btn btn-primary btn-sm mt-4">
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Home;