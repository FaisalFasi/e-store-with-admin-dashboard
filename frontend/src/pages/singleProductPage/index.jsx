import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useProductStore } from "../../stores/useProductStore";
import Button from "../../components/shared/Button/Button";
import ZoomImage from "../../components/shared/ZoomImage/ZoomImage";
import { useCartStore } from "../../stores/useCartStore";
import { toast } from "react-hot-toast";
import { getUserData } from "../../utils/getUserData.js";

const SingleProductPage = () => {
  const { productId } = useParams();
  const {
    fetchProductById,
    products: product,
    loading: isLoading,
  } = useProductStore();

  const { addToCart } = useCartStore();
  const { user } = getUserData();

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = () => {
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size", { id: "size" });
      return;
    }
    addToCart({ ...product, size: selectedSize, quantity });
    toast.success("Product added to cart!");
  };

  const handleAddToWishlist = () => {
    if (!user) {
      toast.error("Please login to add products to wishlist", {
        id: "wishlist",
      });
      return;
    }
    toast.success("Product added to wishlist!");
  };

  useEffect(() => {
    fetchProductById(productId);
    console.log("Product product: ", product);
  }, [productId, fetchProductById]);

  useEffect(() => {
    if (product?.variations?.length > 0) {
      setSelectedImage(product.variations[0].imageUrls[0]);
    }
    if (product?.defaultVariation?.size) {
      setSelectedSize(product.defaultVariation.size); // Default size
    }
  }, [product]);

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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-8"
        >
          {/* Left Section - Images */}
          <div className="flex flex-col-reverse md:flex-row gap-4 items-center">
            <div className="max-w-full h-full flex items-center justify-start py-2 md:py-6 overflow-x-scroll">
              <div className="w-fit flex gap-4">
                {product?.variations?.map((variation, index) => (
                  // Loop through imageUrls in each variation
                  <div
                    key={index}
                    className=" md:h-[400px] flex flex-row md:flex-col gap-4 overflow-hidden overflow-x-auto md:overflow-y-auto"
                  >
                    {variation.imageUrls.map((imageUrl, imgIndex) => (
                      <button
                        key={imgIndex}
                        onClick={() => setSelectedImage(imageUrl)}
                        className={`flex w-fit border-4 transition rounded-sm ${
                          selectedImage === imageUrl
                            ? "border-emerald-400"
                            : "border-gray-600"
                        }`}
                      >
                        <img
                          src={imageUrl}
                          alt={`Thumbnail ${index + 1}-${imgIndex + 1}`}
                          className="w-16 h-16 object-cover rounded-sm"
                        />
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-fit h-full flex items-center justify-center">
              <ZoomImage
                src={selectedImage}
                className=" object-cover w-[320px] h-[400px] md:min-w-fit md:h-[400px] lg:min-w-fit lg:h-[550px] rounded-lg overflow-hidden shadow-lg"
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

            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl lg:text-4xl font-bold text-emerald-400 mb-4"
            >
              {product.name}
            </motion.h1>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {product.description}
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-emerald-400 text-2xl lg:text-3xl font-bold mb-6"
            >
              ${product?.defaultVariation?.price}
            </motion.div>

            {/* Stock Availability */}
            <p className="text-gray-300 mb-6">
              {product?.defaultVariation?.quantity > 0
                ? `In Stock: ${product.defaultVariation.quantity}`
                : "Out of Stock"}
            </p>

            {/* Size Selection */}
            {product.variations && (
              <div className="mb-6">
                <p className="text-gray-300 font-semibold mb-2">Select Size:</p>
                <div className="flex gap-2">
                  {product.variations.map((variation, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSize(variation.size)}
                      className={`px-4 py-2 border rounded-md text-sm ${
                        selectedSize === variation.size
                          ? "bg-emerald-400 text-gray-900"
                          : "bg-gray-800 text-gray-300 border-gray-600"
                      }`}
                    >
                      {variation.size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selection */}
            <div className="mb-6">
              <p className="text-gray-300 font-semibold mb-2">Quantity:</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md"
                >
                  -
                </button>
                <span className="text-lg font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-gray-800 text-gray-300 rounded-md"
                >
                  +
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Add to Cart and Wishlist Buttons */}
              <Button
                isBG={true}
                className="self-start mb-4"
                onClick={handleAddToCart}
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

        {/* FAQs Section */}
        <div className="mt-12">
          <h3 className="text-2xl text-emerald-400 mb-4">FAQs</h3>
          <div className="text-gray-300">
            <p>
              <strong>Q:</strong> How do I track my order?
            </p>
            <p>
              A: You can track your order via the tracking link sent to your
              email.
            </p>
          </div>
          {/* Add more FAQs */}
        </div>
      </div>
    </div>
  );
};

export default SingleProductPage;
