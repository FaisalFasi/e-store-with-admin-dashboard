import React from "react";
import { ShoppingCart } from "lucide-react";
import toast from "react-hot-toast";
import { useUserStore } from "../../../stores/useUserStore";
import { useCartStore } from "../../../stores/useCartStore";
import Navigation from "../../shared/Navigation/Navigation";

const ProductCard = ({ product, index }) => {
  const { user } = useUserStore();
  const { addToCart } = useCartStore();

  console.log("Single Product ------: ", product);
  const handleAddToCart = () => {
    console.log("Add to cart");
    if (!user) {
      toast.error("Please login to add products to cart", { id: "login" });
      return;
    } else {
      addToCart(product);
    }
  };

  return (
    <div className="flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg">
      <Navigation
        to={`/products/${product._id}`}
        className="relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl hover:scale-105 transition-transform duration-300"
      >
        <img
          className="object-cover w-full "
          src={product?.variations[index]?.imageUrls[0]}
          alt="product image"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20" />
      </Navigation>

      <div className="mt-4 px-5 pb-5">
        <h5 className="text-xl font-semibold tracking-tight text-white">
          {product.name}
        </h5>
        <div className="mt-2 mb-5 flex items-center justify-between">
          <p>
            <span className="text-3xl font-bold text-emerald-400">
              ${product.variations[index].price}
            </span>
          </p>
          <p className="text-sm text-gray-400">
            In Stock: {product?.variations[index].quantity}
          </p>
        </div>

        <button
          className="flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
       text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} className="mr-2" />
          Add to cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
