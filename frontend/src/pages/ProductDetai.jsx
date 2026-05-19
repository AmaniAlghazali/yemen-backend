import axios from 'axios';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
    const [product, setProduct] = useState(null);
    // const [qty, setQty] = useState(1);
    const { id } = useParams();

    // 1. YOUR API FETCH EFFECT
    useEffect(() => {
        const getProductDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:8000/api/v1/products/product-detail/${id}`);
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
    const addToCart = () => {
        // 1. Get existing cart from localStorage or start empty
        const existingCart = JSON.parse(localStorage.getItem("cart")) || [];

        // 2. Add the new product
        const newItem = {
            id: product._id,
            title: product.title,
            price: product.price,
            image: imageSrc,
            // quantity: qty
        };

        existingCart.push(newItem);

        // 3. Save back to localStorage
        localStorage.setItem("cart", JSON.stringify(existingCart));

        // 4. TRIGGER AN EVENT so the Navbar knows to update
        window.dispatchEvent(new Event("cartUpdated"));

        alert("🛒 Added to cart!");
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
                        {product?.price} <small className="text-sm font-normal opacity-60">SAR</small>
                    </p>

                    <div className="bg-base-200 p-6 rounded-2xl mb-8">
                        <h3 className="font-bold mb-2">Description</h3>
                        <p className="opacity-70 leading-relaxed">
                            {product?.description || "No description provided for this item."}
                        </p>
                    </div>

                    <div className="mt-auto flex items-center gap-4">
                        {/* <div className="join border border-base-300 rounded-xl">
                            <button className="btn btn-ghost join-item" onClick={() => qty > 0 && setQty(qty - 1)}>-</button>
                            <span className="px-6 flex items-center font-bold bg-base-100">{qty}</span>
                            <button className="btn btn-ghost join-item" onClick={() => setQty(qty + 1)}>+</button>
                        </div> */}
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