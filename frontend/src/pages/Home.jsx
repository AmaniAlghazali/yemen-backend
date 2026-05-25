import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { getCurrencySymbol } from "../utils/currency";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200",
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1200",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200",
];

const Home = () => {
  const { store } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = [
    "Electronics", "Clothing", "Food", "Books",
    "Home & Kitchen", "Beauty", "Sports", "Automotive",
    "Toys & Games", "Health", "Pet Supplies", "Office Supplies",
    "Baby & Kids", "Jewelry", "Music", "Arts & Crafts",
    "Garden", "Tools", "Shoes", "Bags & Luggage",
    "Furniture", "Groceries", "Phones & Tablets",
    "Computers & Laptops", "Cameras", "Smart Home", "Stationery"
  ];

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await axios.get("/api/v1/products/get-all-products", {
          headers: { Authorization: token ? `Bearer ${token}` : "" }
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

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("All");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="bg-base-100 min-h-screen font-sans">
      <div className="carousel w-full h-[250px] sm:h-[350px] md:h-[500px] shadow-inner bg-base-300">
        {[1, 2, 3, 4].map((num) => (
          <div key={num} id={`slide${num}`} className="carousel-item relative w-full group">
            <img
              src={FALLBACK_IMAGES[num - 1]}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              alt={`Slide ${num}`}
              onError={(e) => { e.target.src = `https://placehold.co/1200x500/1a1a2e/eee?text=Welcome+${num}`; }}
            />
            <div className="absolute left-2 md:left-4 right-2 md:right-4 top-1/2 flex -translate-y-1/2 justify-between">
              <a href={`#slide${num === 1 ? 4 : num - 1}`} className="btn btn-circle btn-xs sm:btn-sm md:btn-md glass">❮</a>
              <a href={`#slide${num === 4 ? 1 : num + 1}`} className="btn btn-circle btn-xs sm:btn-sm md:btn-md glass">❯</a>
            </div>
          </div>
        ))}
      </div>

      <div className="container mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="w-full lg:w-1/4 space-y-6">
            <div className="bg-base-200 p-5 md:p-6 rounded-3xl shadow-sm lg:sticky lg:top-8 border border-base-300">
              <h2 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-2">
                <span className="w-2 h-8 bg-primary rounded-full"></span> Filters
              </h2>
              <div className="space-y-4">
                <div className="form-control">
                  <label className="label-text font-bold mb-2 text-sm">Keyword</label>
                  <div className="relative">
                    <input type="text" placeholder="Search items..."
                      className="input input-bordered w-full pl-10 text-sm"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    <span className="absolute left-3 top-3.5 opacity-40 text-sm">🔍</span>
                  </div>
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-2 text-sm">Category</label>
                  <select className="select select-bordered w-full capitalize text-sm"
                    value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="All">All Categories</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="form-control">
                  <label className="label-text font-bold mb-2 text-sm">Price Range ({getCurrencySymbol(store.currency)})</label>
                  <div className="flex items-center gap-2">
                    <input type="number" placeholder="Min" className="input input-bordered input-sm w-full text-sm"
                      value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <span className="opacity-40">-</span>
                    <input type="number" placeholder="Max" className="input input-bordered input-sm w-full text-sm"
                      value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                  </div>
                </div>
                <button onClick={resetFilters} className="btn btn-outline btn-sm w-full mt-4 rounded-xl">
                  Reset All
                </button>
              </div>
            </div>
          </aside>

          <main className="w-full lg:w-3/4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className='text-3xl md:text-5xl font-black text-base-content'>Our Collection</h1>
                <p className="text-base-content/60 mt-2 text-sm md:text-base">
                  Showing {filteredProducts.length} items
                </p>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <span className="loading loading-spinner loading-lg text-primary"></span>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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