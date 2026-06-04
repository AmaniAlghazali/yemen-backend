import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import ProductCard from "../components/ProductCard";
import { useStore } from "../context/StoreContext";
import { getCurrencySymbol, formatPrice } from "../utils/currency";

const ITEMS_PER_PAGE = 15;

const CATEGORIES = [
  "Electronics", "Clothing", "Food", "Books",
  "Home & Kitchen", "Beauty", "Sports", "Automotive",
  "Toys & Games", "Health", "Pet Supplies", "Office Supplies",
  "Baby & Kids", "Jewelry", "Music", "Arts & Crafts",
  "Garden", "Tools", "Shoes", "Bags & Luggage",
  "Furniture", "Groceries", "Phones & Tablets",
  "Computers & Laptops", "Cameras", "Smart Home", "Stationery",
];

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
  { label: "Name: Z-A", value: "name-desc" },
];

const AllProducts = () => {
  const { store } = useStore();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({ page });
        if (search) params.set("keyword", search);
        if (selectedCategory) params.set("category", selectedCategory);
        if (minPrice) params.set("price[gte]", minPrice);
        if (maxPrice) params.set("price[lte]", maxPrice);
        const res = await axios.get(`/api/v1/products/get-all-products?${params}`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (res.data.success) {
          setProducts(res.data.products || []);
          setTotalCount(res.data.totalCount || 0);
        } else {
          setProducts([]);
          setTotalCount(0);
        }
      } catch (error) {
        console.error(error);
        setProducts([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [page, search, selectedCategory, minPrice, maxPrice]);

  const sortedProducts = useMemo(() => {
    const list = [...products];
    switch (sort) {
      case "price-asc": return list.sort((a, b) => a.price - b.price);
      case "price-desc": return list.sort((a, b) => b.price - a.price);
      case "name-asc": return list.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
      case "name-desc": return list.sort((a, b) => (b.title || "").localeCompare(a.title || ""));
      default: return list;
    }
  }, [products, sort]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const hasActiveFilters = search || selectedCategory || minPrice || maxPrice;

  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    let start = Math.max(1, page - Math.floor(showPages / 2));
    let end = Math.min(totalPages, start + showPages - 1);
    if (end - start + 1 < showPages) start = Math.max(1, end - showPages + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-base-200">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-base-content tracking-tight">
            Products
          </h1>
          <p className="text-sm sm:text-base text-base-content/50 mt-1">
            {totalCount > 0
              ? `${totalCount} product${totalCount !== 1 ? "s" : ""} — Page ${page} of ${totalPages}`
              : "Browse our collection"}
          </p>
        </div>

        {/* Top Bar: Search + Sort + View Toggle + Filter Toggle (mobile) */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="input input-bordered w-full pl-9 h-10 text-sm rounded-xl"
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/30 hover:text-base-content/60">
                ✕
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="select select-bordered h-10 text-sm rounded-xl min-w-[130px]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          {/* View Toggle (desktop) */}
          <div className="hidden sm:flex items-center bg-base-100 border border-base-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 ${viewMode === "grid" ? "bg-primary text-primary-content" : "text-base-content/50 hover:text-base-content"}`}
              title="Grid view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z"/>
              </svg>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 ${viewMode === "list" ? "bg-primary text-primary-content" : "text-base-content/50 hover:text-base-content"}`}
              title="List view"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M2.5 12a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5zm0-4a.5.5 0 01.5-.5h10a.5.5 0 010 1H3a.5.5 0 01-.5-.5z"/>
              </svg>
            </button>
          </div>

          {/* Filter Toggle (mobile) */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn btn-sm h-10 rounded-xl sm:hidden ${hasActiveFilters ? "btn-primary" : "btn-outline"}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
            {hasActiveFilters && <span className="badge badge-sm badge-primary ml-1">{hasActiveFilters}</span>}
          </button>

          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn btn-ghost btn-sm h-10 text-xs rounded-xl text-base-content/50 hover:text-error">
              Clear all
            </button>
          )}
        </div>

        <div className="flex gap-4 sm:gap-6">
          {/* Sidebar Filters (desktop always visible, mobile toggle) */}
          <aside className={`
            ${showFilters ? "fixed inset-0 z-50 flex" : "hidden"}
            sm:relative sm:inset-auto sm:z-auto sm:block sm:w-56 lg:w-64 flex-shrink-0
          `}>
            {/* Mobile overlay */}
            {showFilters && (
              <div className="sm:hidden fixed inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
            )}

            <div className={`
              relative w-[280px] sm:w-full h-full sm:h-auto
              bg-base-100 sm:bg-transparent
              ${showFilters ? "overflow-y-auto" : ""}
              p-4 sm:p-0
            `}>
              {/* Mobile header */}
              <div className="flex items-center justify-between mb-4 sm:hidden">
                <h3 className="font-bold text-lg">Filters</h3>
                <button onClick={() => setShowFilters(false)} className="btn btn-sm btn-circle btn-ghost">✕</button>
              </div>

              <div className="space-y-4 sm:sticky sm:top-4">
                {/* Category */}
                <div className="bg-base-100 rounded-2xl border border-base-300 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">Category</h4>
                  <div className="space-y-0.5 max-h-64 overflow-y-auto">
                    <button
                      onClick={() => { setSelectedCategory(""); setPage(1); }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                        !selectedCategory ? "bg-primary/10 text-primary font-bold" : "hover:bg-base-200 text-base-content/70"
                      }`}
                    >
                      All Categories
                    </button>
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => { setSelectedCategory(cat); setPage(1); }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
                          selectedCategory === cat ? "bg-primary/10 text-primary font-bold" : "hover:bg-base-200 text-base-content/70"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div className="bg-base-100 rounded-2xl border border-base-300 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-3">
                    Price Range ({getCurrencySymbol(store.currency)})
                  </h4>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                      className="input input-bordered input-sm w-full text-sm rounded-xl"
                    />
                    <span className="text-base-content/30 text-sm">—</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                      className="input input-bordered input-sm w-full text-sm rounded-xl"
                    />
                  </div>
                </div>

                {/* Apply / Clear (mobile) */}
                <div className="sm:hidden flex gap-2">
                  <button onClick={clearFilters} className="btn btn-outline flex-1 rounded-xl btn-sm">
                    Clear
                  </button>
                  <button onClick={() => setShowFilters(false)} className="btn btn-primary flex-1 rounded-xl btn-sm">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-2xl border border-base-300">
                <span className="loading loading-spinner loading-lg text-primary mb-3" />
                <p className="text-sm text-base-content/40 font-medium">Loading products...</p>
              </div>
            ) : sortedProducts.length > 0 ? (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                    {sortedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-base-100 rounded-2xl border border-base-300 divide-y divide-base-200 overflow-hidden">
                    {sortedProducts.map((product) => (
                      <div key={product.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-base-200/40 transition-colors">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-base-200 overflow-hidden flex-shrink-0 border border-base-300">
                          {product.images?.[0]?.url ? (
                            <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-base-content/20">📦</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-base-content/50 capitalize font-medium mb-0.5">{product.category}</p>
                          <h3 className="font-bold text-sm sm:text-base truncate">{product.title}</h3>
                          <p className="text-xs text-base-content/50 line-clamp-1 mt-0.5">{product.description || ""}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-black text-sm sm:text-lg text-primary">
                            {formatPrice(product.price, store.currency)}
                          </p>
                          <span className={`text-xs font-medium ${product.stock < 5 ? "text-error" : "text-base-content/40"}`}>
                            {product.stock < 5 ? `Only ${product.stock} left` : `Stock: ${product.stock}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 sm:mt-8 p-3 sm:p-4 bg-base-100 rounded-2xl border border-base-300">
                    <span className="text-xs sm:text-sm text-base-content/50 order-2 sm:order-1">
                      Page {page} of {totalPages}
                    </span>

                    <div className="flex items-center gap-1 order-1 sm:order-2">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className={`btn btn-sm rounded-xl btn-ghost ${page === 1 ? "opacity-30" : ""}`}
                      >
                        ‹
                      </button>

                      {page > 3 && (
                        <>
                          <button onClick={() => setPage(1)} className="btn btn-sm rounded-xl btn-ghost w-9 h-9 min-h-0 p-0 text-sm font-medium">1</button>
                          <span className="text-xs text-base-content/30 px-1">...</span>
                        </>
                      )}

                      {getPageNumbers().map((p) => (
                        <button
                          key={p}
                          onClick={() => setPage(p)}
                          className={`btn btn-sm rounded-xl w-9 h-9 min-h-0 p-0 text-sm font-medium ${
                            p === page ? "btn-primary shadow-md shadow-primary/20" : "btn-ghost"
                          }`}
                        >
                          {p}
                        </button>
                      ))}

                      {page < totalPages - 2 && (
                        <>
                          <span className="text-xs text-base-content/30 px-1">...</span>
                          <button onClick={() => setPage(totalPages)} className="btn btn-sm rounded-xl btn-ghost w-9 h-9 min-h-0 p-0 text-sm font-medium">{totalPages}</button>
                        </>
                      )}

                      <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="btn btn-sm rounded-xl btn-ghost"
                      >
                        ›
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 bg-base-100 rounded-2xl border border-base-300">
                <span className="text-5xl mb-4">🔍</span>
                <p className="text-lg font-bold text-base-content/50 mb-1">No products found</p>
                <p className="text-sm text-base-content/30 mb-4">Try adjusting your search or filter criteria</p>
                <button onClick={clearFilters} className="btn btn-primary btn-sm rounded-xl">
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllProducts;
