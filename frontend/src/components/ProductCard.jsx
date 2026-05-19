import {Link} from 'react-router-dom'
const ProductCard = ({product}) => {
// console.log(product);
     // --- UNIVERSAL IMAGE LOGIC ---
                    let imageSrc = "https://via.placeholder.com/400?text=No+Image";
                    if (product.images) {
                      if (Array.isArray(product.images) && product.images.length > 0) {
                        // Handles Array format (Laptops)
                        imageSrc = product.images[0].url;
                      } else if (product.images.url) {
                        // Handles Object format (T-shirt)
                        imageSrc = product.images.url;
                      } else if (typeof product.images === "string") {
                        // Handles direct String URL
                        imageSrc = product.images;
                      }
                    }

  return (
    <Link to={`/product-detail/${product._id}`}>
        <div key={product._id} className="group card bg-base-100 shadow-sm hover:shadow-2xl transition-all duration-500 border border-base-300 overflow-hidden rounded-2xl">
                        <figure className="relative h-40 md:h-64 bg-base-200">
                          <img
                            src={imageSrc}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => { e.target.src = "https://via.placeholder.com/400?text=Link+Error"; }}
                          />
                          {product.stock < 5 && (
                            <div className="absolute top-2 right-2 badge badge-error text-[10px] md:badge-md font-bold">Limited</div>
                          )}
                        </figure>
                        
                        <div className="card-body p-4 md:p-6">
                          <span className="text-[10px] uppercase tracking-widest opacity-50 font-bold">{product.category}</span>
                          <h2 className="card-title text-sm md:text-xl font-bold truncate">
                            {product.title}
                          </h2>
                          
                          <div className="flex flex-col mt-auto pt-4 border-t border-base-200">
                            <span className="text-lg md:text-3xl font-black text-primary">
                              {product.price} <small className="text-xs font-normal">SAR</small>
                            </span>
                            
                            <div className="flex justify-between items-center mt-4">
                              <button className="btn btn-primary btn-sm md:btn-md rounded-xl group-hover:px-8 transition-all">
                                Buy Now
                              </button>
                              <span className="text-[10px] md:text-xs font-medium opacity-40">Qty: {product.stock}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      </Link>
  )
}

export default ProductCard