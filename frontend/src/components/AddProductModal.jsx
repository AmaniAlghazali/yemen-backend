import categories from "../constants/categories";

const AddProductModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  image,
  setImage,
  imagePreview,
  setImagePreview,
  isSubmitting,
  imageUrl,
  setImageUrl,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-base-100 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6 border border-base-300">
        <div className="flex justify-between items-center border-b border-base-300 pb-3 mb-4">
          <h3 className="text-xl font-extrabold">Add New Product</h3>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold">Product Title</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="input input-bordered w-full rounded-xl"
              required
            />
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
              className="textarea textarea-bordered w-full rounded-xl"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Price</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="input input-bordered w-full rounded-xl"
                required
              />
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text font-semibold">Stock</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
                className="input input-bordered w-full rounded-xl"
                required
              />
            </div>
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold">Category</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="select select-bordered w-full rounded-xl"
              required
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold">Image URL</span>
            </label>
            <input
              type="url"
              placeholder="https://example.com/image.jpg"
              value={imageUrl}
              onChange={(e) => {
                setImageUrl(e.target.value);
                if (e.target.value) {
                  setImage(null);
                  setImagePreview(e.target.value);
                }
              }}
              className="input input-bordered w-full rounded-xl"
            />
          </div>
          <div className="divider text-xs text-base-content/30">OR</div>
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text font-semibold">Upload File</span>
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                setImage(file);
                if (file) {
                  setImageUrl("");
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
              className="file-input file-input-bordered w-full rounded-xl"
            />
          </div>
          {imagePreview && (
            <div className="relative w-28 h-28 mx-auto border border-base-300 rounded-2xl overflow-hidden shadow-inner bg-base-200">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setImage(null);
                  setImagePreview("");
                  setImageUrl("");
                }}
                className="absolute top-1 right-1 bg-error text-error-content w-6 h-6 rounded-full flex items-center justify-center text-xs shadow"
              >
                ✕
              </button>
            </div>
          )}
          <div className="flex gap-3 pt-4 border-t border-base-300 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary flex-1 rounded-xl shadow-md"
            >
              {isSubmitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductModal;
