import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { useCartStore } from "../../../stores/useCartStore";
import Navigation from "../../shared/Navigation/Navigation";
import { Link } from "react-router-dom";
import { usePrice } from "@/utils/currency/currency";

const ProductCarousel = ({
  products = [],
  title = "Products",
  titleColor = "emerald", // featured: emerald, recommended : blue,New arrival: purple,Sale items: red,recently viewed: amber
  itemLinkPath = "/products",
  showAddToCart = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  const { addToCart } = useCartStore();
  const { formatPrice } = usePrice();

  useEffect(() => {}, [products]);

  useEffect(() => {
    const handleResize = () => {
      let newItemsPerPage = 4;
      if (window.innerWidth < 640) newItemsPerPage = 1;
      else if (window.innerWidth < 1024) newItemsPerPage = 2;
      else if (window.innerWidth < 1280) newItemsPerPage = 3;

      setItemsPerPage(newItemsPerPage);

      // Adjust the currentIndex to avoid going out of bounds
      const maxIndex = Math.max(0, products.length - newItemsPerPage);
      setCurrentIndex((prevIndex) => Math.min(prevIndex, maxIndex));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products.length]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerPage;
      return Math.min(nextIndex, products.length - itemsPerPage);
    });
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => Math.max(prevIndex - itemsPerPage, 0));
  };

  const isStartDisabled = currentIndex === 0;
  const isEndDisabled = currentIndex >= products.length - itemsPerPage;
  const showNavigationButtons = products.length > itemsPerPage;

  const getProductImageUrl = (product) => {
    return (
      product?.variations?.[0]?.colors?.[0]?.imageUrls?.[0] ||
      product?.imageUrl ||
      "/images/imagePlaceholder.jpg"
    );
  };

  const getProductPrice = (product) => {
    return (
      product?.variations?.[0]?.colors?.[0]?.sizes?.[0]?.price?.amount ||
      product?.price?.basePrice ||
      0
    );
  };

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <h2
          className={`text-center text-4xl md:text-6xl font-bold text-${titleColor}-400 mb-4`}
        >
          {title}
        </h2>
        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{
                transform: `translateX(-${
                  currentIndex * (100 / itemsPerPage)
                }%)`,
              }}
            >
              {products?.length > 0 ? (
                products?.map((product) => {
                  const productImageUrl = getProductImageUrl(product);
                  const productPrice = getProductPrice(product);

                  return (
                    <div
                      key={product._id || product.id}
                      className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 flex-shrink-0 px-2"
                    >
                      <div className="flex flex-col justify-between bg-white bg-opacity-10 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden h-full transition-all duration-300 hover:shadow-xl border border-emerald-500/30">
                        <div className="overflow-hidden">
                          <Navigation
                            to={`${itemLinkPath}/${product._id || product.id}`}
                          >
                            <img
                              src={productImageUrl}
                              alt={product.name}
                              className="w-full h-48 object-cover transition-transform duration-300 ease-in-out hover:scale-110"
                            />
                          </Navigation>
                        </div>
                        <div className="flex flex-col justify-between h-[200px] p-4">
                          <div>
                            <h3 className="text-lg font-semibold mb-2 text-white">
                              {product.name}
                            </h3>
                            <p
                              className={`text-${titleColor}-300 font-medium mb-4`}
                            >
                              {formatPrice(productPrice || 0)}
                            </p>
                          </div>
                          {showAddToCart && (
                            <Link
                              to={`${itemLinkPath}/${
                                product._id || product.id
                              }`}
                              className={`w-full bg-${titleColor}-600 hover:bg-${titleColor}-500 text-white bg-emerald-700 hover:bg-emerald-600 font-semibold py-2 px-4 rounded transition-colors duration-300 flex items-center justify-center`}
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" />
                              Goto add Cart
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full text-center py-8 text-white">
                  No products available
                </div>
              )}
            </div>
          </div>
          {showNavigationButtons && products.length > 0 && (
            <>
              <button
                onClick={prevSlide}
                disabled={isStartDisabled}
                className={`absolute top-1/2 -left-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
                  isStartDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                disabled={isEndDisabled}
                className={`absolute top-1/2 -right-4 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-300 ${
                  isEndDisabled
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-500"
                }`}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCarousel;
