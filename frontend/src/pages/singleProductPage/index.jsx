import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";
import { useProductStore } from "../../stores/useProductStore";

const SingleProductPage = () => {
  const { productId } = useParams(); // Extract productId from URL
  const { fetchProductById, product, loading: isLoading } = useProductStore();
  const [selectedImage, setSelectedImage] = useState("");
  const { image } = product;
  console.log("product:", product);

  useEffect(() => {
    fetchProductById(productId);
  }, [productId, fetchProductById]);

  useEffect(() => {
    // Set the first image as the default selected image
    if (product?.images?.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  if (isLoading) {
    return <div className="text-center text-white">Loading...</div>;
  }

  if (!product) {
    return <div className="text-center text-white">Product not found!</div>;
  }

  return (
    <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16"
        >
          {/* Left Section - Images */}
          <div className="flex flex-col items-center">
            <motion.img
              src={selectedImage}
              alt="Selected Product"
              className="w-full max-w-md rounded-lg shadow-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            />
            <div className="flex gap-4 mt-4 overflow-x-auto">
              <button
                // onClick={() => setSelectedImage(image)}
                className={`border-2 rounded-md ${
                  "border-gray-600"
                  //   selectedImage === image
                  // ? "border-emerald-400"
                  // : "border-gray-600"
                }`}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${1}`}
                  className="w-16 h-16 object-cover rounded-md"
                />
              </button>
            </div>
            <div className="flex gap-4 mt-4 overflow-x-auto">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`border-2 rounded-md ${
                    selectedImage === image
                      ? "border-emerald-400"
                      : "border-gray-600"
                  }`}
                >
                  <img
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Section - Product Details */}
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl font-bold text-emerald-400 mb-4"
            >
              {product.name}
            </motion.h1>
            <p className="text-gray-300 mb-6">{product.description}</p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-emerald-400 text-3xl font-bold mb-4"
            >
              ${product.price}
            </motion.div>
            <button className="px-6 py-3 bg-emerald-400 text-white font-bold rounded-lg shadow-lg hover:bg-emerald-500 transition">
              Add to Cart
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SingleProductPage;
