import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useStore } from "../context/StoreContext";
import { formatPrice } from "../utils/currency";

const ProductDetail = () => {
    const { store } = useStore();
    const [product, setProduct] = useState(null);
    const [qty, setQty] = useState(1);
    const { id } = useParams();

    // 1. YOUR API FETCH EFFECT
    useEffect(() => {
        const getProductDetails = async () => {
            try {
                const response = await axios.get(`/api/v1/products/product-detail/${id}`);
                setProduct(response.data.product);
            } catch (error) {
                console.error(error);
            }
        };
        getProductDetails();
    }, [id]);

    // 2. PLACE THE DEBUGGING LOG HERE (This shows data as it arrives)
    useEffect(() => {
        if (product) {
            console.log("Verified Product Data:", product);
            console.log("Image Data specifically:", product.images);
        }
    }, [product]);

    if (!product) {
        return <div className="text-center mt-20">Loading...</div>;
    }

    // 3. IMAGE LOGIC (Must be after the !product check)
    let imageSrc = "https://via.placeholder.com/600?text=No+Image";
    if (product?.images) {
        if (Array.isArray(product?.images) && product?.images?.length > 0) {
            imageSrc = product?.images[0]?.url;
        } else if (product?.images?.url) {
            imageSrc = product?.images?.url;
        } else if (typeof product?.images === "string") {
            imageSrc = product?.images;
        }
    }
    console.log(imageSrc);
    const addToCart = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Please login first!");
            return;
        }
        try {
            await axios.post(
                "/api/v1/cart/add",
                {
                    productId: product._id,
                    title: product.title,
                    price: product.price,
                    image: imageSrc,
                    quantity: qty,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            window.dispatchEvent(new Event("cartUpdated"));
            alert("Added to cart!");
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to add to cart");
        }
    };
    return (
        <div className="max-w-7xl mx-auto px-4 py-10 font-sans">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Image Section */}
                <div className="w-full">
                    <img
                        src={imageSrc}
                        alt={product?.title}
                        className="w-full h-[450px] object-cover rounded-3xl shadow-xl border border-base-200"
                        onError={(e) => { e.target.src = "https://via.placeholder.com/600?text=Link+Broken"; }}
                    />
                </div>

                {/* Details Section */}
                <div className="flex flex-col">
                    <div className="mb-6">
                        <h1 className="text-4xl font-black mb-2">{product.title}</h1>
                        <div className="badge badge-primary badge-outline capitalize">{product.category}</div>
                    </div>

                    <p className="text-3xl font-black text-primary mb-6">
                        {formatPrice(product?.price, store.currency)}
                    </p>

                    <div className="bg-base-200 p-6 rounded-2xl mb-8">
                        <h3 className="font-bold mb-2">Description</h3>
                        <p className="opacity-70 leading-relaxed">
                            {product?.description || "No description provided for this item."}
                        </p>
                    </div>

                    <div className="mt-auto flex items-center gap-4">
                        <div className="join border border-base-300 rounded-xl">
                            <button className="btn btn-ghost join-item" onClick={() => qty > 1 && setQty(qty - 1)}>-</button>
                            <span className="px-6 flex items-center font-bold bg-base-100">{qty}</span>
                            <button className="btn btn-ghost join-item" onClick={() => setQty(qty + 1)}>+</button>
                        </div>
                        <button
                            className="btn btn-primary flex-1 rounded-xl font-bold shadow-lg"
                            onClick={addToCart}>
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;