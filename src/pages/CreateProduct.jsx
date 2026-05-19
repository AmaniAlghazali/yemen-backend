import { useState } from 'react';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const CreateProduct = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price: "",
        category: "clothing",
        stock: 1,
        image: "" // Base64 string goes here
    });

    const categories = ["electronics", "clothing", "food", "books", "accessories"];

    // Handle input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Handle Image Upload & Convert to Base64
    const handleImage = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setFormData({ ...formData, image: reader.result });
        };
        if (file) reader.readAsDataURL(file);
    };

   const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Get the token we saved during Login
    const token = localStorage.getItem("token");

    // If there is no token, don't even try to send the request
    if (!token) {
        alert("Please login to your account first!");
        return;
    }

    try {
        const productData = {
            title: formData.title,
            description: formData.description,
            price: Number(formData.price),
            category: formData.category,
            images: [{ public_id: "1", url: formData.image }],
            stock: Number(formData.stock)
        };

        // Attach the token to the Authorization header
        const config = {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };

        const res = await axios.post(
            "http://localhost:8000/api/v1/products/create-product", 
            productData, 
            config 
        );
        console.log(res);
        

        alert("✅ Product added successfully!");
        // 2. Move to the Home page to see all products
            navigate("/");
    } catch (error) {
        console.error("Backend Response Error:", error.response?.data);
        alert(error.response?.data?.message || "Error adding product");
    }
};

    return (
        <div className="min-h-screen bg-base-200 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-black mb-8 text-center uppercase tracking-tighter">Add New Product</h1>

                <div className="grid lg:grid-cols-2 gap-8 items-start">

                    {/* LEFT: FORM */}
                    <form onSubmit={handleSubmit} className="card bg-base-100 shadow-2xl p-8 rounded-3xl border border-base-300">
                        <div className="space-y-5">
                            <div className="form-control">
                                <label className="label font-bold text-xs uppercase opacity-60">Product Title</label>
                                <input name="title" type="text" placeholder="e.g. Leather Shoes" className="input input-bordered focus:input-primary font-medium" onChange={handleChange} required />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-control">
                                    <label className="label font-bold text-xs uppercase opacity-60">Price (SAR)</label>
                                    <input name="price" type="number" placeholder="0.00" className="input input-bordered focus:input-primary" onChange={handleChange} required />
                                </div>
                                <div className="form-control">
                                    <label className="label font-bold text-xs uppercase opacity-60">Stock Qty</label>
                                    <input name="stock" type="number" className="input input-bordered focus:input-primary" onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-xs uppercase opacity-60">Category</label>
                                <select name="category" className="select select-bordered" onChange={handleChange}>
                                    {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-xs uppercase opacity-60">Description</label>
                                <textarea name="description" className="textarea textarea-bordered h-24" placeholder="Tell us about the product..." onChange={handleChange}></textarea>
                            </div>

                            <div className="form-control">
                                <label className="label font-bold text-xs uppercase opacity-60">Product Photo</label>
                                <input type="file" className="file-input file-input-bordered file-input-primary w-full" onChange={handleImage} accept="image/*" />
                            </div>

                            <button className="btn btn-primary btn-block btn-lg rounded-2xl shadow-lg mt-4 font-black">
                                Publish Product
                            </button>
                        </div>
                    </form>

                    {/* RIGHT: LIVE PREVIEW */}
                    <div className="sticky top-8">
                        <h2 className="text-center font-bold text-sm opacity-40 mb-4 uppercase">Live Preview</h2>
                        <div className="card bg-base-100 shadow-xl border border-base-300 overflow-hidden rounded-3xl max-w-sm mx-auto">
                            <figure className="h-64 bg-base-300 relative">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex items-center justify-center text-5xl">🖼️</div>
                                )}
                            </figure>
                            <div className="card-body">
                                <div className="badge badge-secondary badge-sm mb-2">{formData.category}</div>
                                <h2 className="card-title text-2xl font-bold">{formData.title || "Product Name"}</h2>
                                <p className="text-sm opacity-60 line-clamp-2">{formData.description || "No description provided yet."}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-2xl font-black text-primary">{formData.price || "0"} SAR</span>
                                    <span className="text-xs font-medium opacity-50">Stock: {formData.stock}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CreateProduct;