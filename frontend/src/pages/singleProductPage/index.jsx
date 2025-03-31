import React from "react";
import { motion } from "framer-motion";
import Button from "@/components/shared/Button/Button";
import ZoomImage from "@/components/shared/ZoomImage/ZoomImage";
import { useSingleProduct } from "../../hooks/useSingleProduct";
import ReviewCommentSection from "../../components/reviews/ReviewCommentSection/ReviewCommentSection";
import { getUserData } from "../../utils/getUserData.js";

const SingleProductPage = () => {
  const { user } = getUserData();

  const {
    product,
    isLoading,
    selectedImage,
    selectedColor,
    selectedSize,
    selectedQuantity,
    uniqueColors,
    sizesForSelectedColor,
    selectedSizeObj,
    handleAddToCart,
    handleColorChange,
    handleSizeChange,
    handleQuantityChange,
    handleAddToWishlist,
    selectedColorObj,
    setSelectedImage,
  } = useSingleProduct();

  if (isLoading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center text-white">Product not found!</div>;
  }
  return (
    <div className="relative min-h-screen bg-gray-900 text-white">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-12"
        >
          {/* Left Section - Images */}
          <div className="flex flex-col-reverse md:flex-row gap-6 items-center">
            {/* Thumbnails */}
            <div className="max-w-full h-full flex items-center justify-start py-2 md:py-6 overflow-x-scroll">
              <div className="w-fit flex md:flex-col gap-4">
                {selectedColorObj?.imageUrls?.map((imageUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imageUrl)}
                    className={`flex w-fit border-4 transition rounded-lg ${
                      selectedImage === imageUrl
                        ? "border-emerald-400"
                        : "border-gray-600"
                    }`}
                  >
                    <img
                      src={imageUrl}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Main Image */}
            <div className="w-[320px] h-[400px] md:w-[320px] lg:w-[550px] md:h-[400px] lg:h-[400px] xl:h-[550px]">
              <ZoomImage
                src={selectedImage}
                className="object-cover rounded-lg overflow-hidden shadow-lg w-[320px] h-[400px] md:w-[320px] lg:w-[550px] md:h-[400px] lg:h-[400px] xl:h-[550px]"
              />
            </div>
          </div>

          {/* Right Section - Product Details */}
          <div className="flex flex-col justify-center">
            {/* Breadcrumb Navigation */}
            <div className="text-gray-400 text-sm mb-4">
              <span className="cursor-pointer">Home</span> &gt;{" "}
              <span className="cursor-pointer">Category</span> &gt;{" "}
              <span className="font-bold">{product.name}</span>
            </div>

            {/* Product Name */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-4"
            >
              {product.name}
            </motion.h1>

            {/* Product Description */}
            <p className="text-gray-300 mb-6 leading-relaxed">
              {product.description}
            </p>

            {/* Price Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-emerald-400 text-2xl lg:text-3xl font-bold mb-6"
            >
              ${selectedSizeObj?.price || product.basePrice}
            </motion.div>

            {/* Stock Availability */}
            <p
              className={`w-fit p-2 mb-2 border ${
                selectedSizeObj?.quantity > 0
                  ? "text-gray-300"
                  : " p-2 text-red-500 font-bold text-xl border-red-400"
              }`}
            >
              {selectedSizeObj?.quantity > 0
                ? `In Stock: ${selectedSizeObj?.quantity}`
                : "Out of Stock"}
            </p>

            {/* Color Selection */}
            <div className="bg-gray-800 p-6 rounded-lg mb-6">
              <p className="text-gray-300 font-semibold mb-4">Select Color:</p>
              <div className="flex flex-wrap gap-3">
                {uniqueColors?.map((color, index) => (
                  <span key={index} className="flex flex-col items-center">
                    <button
                      onClick={() => handleColorChange(color?.name)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        color?.name === selectedColor
                          ? "border-emerald-400 scale-110"
                          : "border-gray-600 hover:border-gray-500"
                      }`}
                      style={{ backgroundColor: color?.color }}
                    />
                    <span className="text-[12px] mt-1">
                      {color?.name.slice(0, 10)}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Size Selection (only shown if a color is selected) */}
            {selectedColor && (
              <div className="mb-6">
                <p className="text-gray-300 font-semibold mb-2">Select Size:</p>
                <div className="flex flex-wrap gap-2">
                  {sizesForSelectedColor?.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => handleSizeChange(size)}
                      className={`px-4 py-2 border rounded-md text-sm text-gray-300 border-gray-600 focus:bg-emerald-400 ${
                        size === selectedSize ? "bg-emerald-400 text-white" : ""
                      }`}
                      disabled={
                        product.variations.find((v) =>
                          v.colors.some(
                            (c) =>
                              c.name === selectedColor &&
                              c.sizes.some((s) => s.value === size)
                          )
                        )?.quantity === 0
                      }
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {selectedSizeObj?.quantity > 0 && (
              <>
                {/* Quantity Selection (only shown if a size is selected) */}
                {selectedSize && (
                  <div className="mb-6">
                    <p className="text-gray-300 font-semibold mb-2">
                      Quantity:
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange("decrement")}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                        disabled={selectedQuantity <= 1}
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {selectedQuantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange("increment")}
                        className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md hover:bg-gray-700"
                        disabled={selectedQuantity >= selectedSizeObj?.quantity}
                      >
                        +
                      </button>
                    </div>
                    {selectedSizeObj?.quantity > 0 && (
                      <p className="text-sm text-gray-400 mt-2">
                        Max quantity: {selectedSizeObj?.quantity}
                      </p>
                    )}
                  </div>
                )}

                {/* Add to Cart and Wishlist Buttons */}
                <div className="flex items-center gap-4">
                  <Button
                    isBG={true}
                    className="self-start mb-4"
                    onClick={handleAddToCart}
                    disabled={!selectedColor || !selectedSize}
                  >
                    Add to Cart
                  </Button>
                  <Button
                    isBG={true}
                    className="self-start bg-gray-700"
                    onClick={handleAddToWishlist}
                  >
                    Add to Wishlist
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>

        {/* Shipping/Delivery Details */}
        <div className="mt-12">
          <h3 className="text-2xl text-emerald-400 mb-4">
            Shipping & Delivery
          </h3>
          <p className="text-gray-300">
            Free shipping on orders over $50. Estimated delivery time: 5-7
            business days.
          </p>
        </div>

        {/* Related Products */}
        <div className="mt-12">
          <h3 className="text-2xl text-emerald-400 mb-4">Related Products</h3>
          <div className="flex gap-4">
            {/* Related Products Placeholder */}
            <div className="w-1/4 bg-gray-800 p-4 rounded-lg">
              <img
                src="https://placehold.co/300x400"
                alt="Related Product"
                className="w-full h-[200px] object-cover mb-4 rounded-lg"
              />
              <h4 className="text-gray-300">Product Name</h4>
              <p className="text-gray-400">$XX.XX</p>
            </div>
            {/* Add more related products */}
          </div>
        </div>

        {/* Comment and Review Section */}
        {user && <ReviewCommentSection productId={product._id} />}
      </div>
    </div>
  );
};

export default SingleProductPage;
