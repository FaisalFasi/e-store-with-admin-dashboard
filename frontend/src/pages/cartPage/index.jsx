import React, { useEffect } from "react";
import { useCartStore } from "../../stores/useCartStore";
import AddressForm from "../../components/checkout/AddressForm/AddressForm";
import CartView from "../../components/cart/CartView/CartView";
import { useCheckoutStore } from "../../stores/useCheckoutStore";
import PeopleAlsoBought from "../../components/products/PeopleAlsoBought/PeopleAlsoBought";
import ProgressBar from "../../components/cart/ProgressBar/ProgressBar";
import { motion } from "framer-motion";
import CartItem from "../../components/cart/CartItem/CartItem";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { getUserData } from "../../utils/getUserData";

const CartPage = () => {
  const { cart, getCartItems } = useCartStore();
  const { currentStep, isAddressModalOpen } = useCheckoutStore();
  const { user } = getUserData();

  useEffect(() => {
    getCartItems();
  }, []);

  if (!user) {
    return <Navigate to="/" />;
  }
  console.log("Cart Items:", cart);
  return (
    <div className="relative z-10 container mx-auto px-4">
      {cart.length > 0 && (
        <motion.div>
          <motion.h1
            className="text-4xl font-bold mb-8 text-emerald-400 text-center"
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Cart Items
          </motion.h1>
          {/* Progress Bar */}
          <div className="mb-6">
            <ProgressBar />
          </div>
        </motion.div>
      )}
      <motion.div
        className="mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {Array.isArray(cart) && cart.length > 0 ? (
          <div className="space-y-6">
            {cart?.map((item, index) => {
              if (!item) return null;
              console.log("Item in page:", item);
              // Generate a unique key using product ID and variation ID
              const uniqueKey = `${item._id}-${index}`;

              return (
                <CartItem
                  key={uniqueKey} // Unique key
                  item={item}
                  index={index}
                />
              );
            })}
          </div>
        ) : (
          <EmptyCartUI />
        )}
      </motion.div>
      {/* Cart View */}
      {/* {currentStep === "cart" && cart.length > 0 && <CartView cart={cart} />} */}

      {/* Address Form */}
      {isAddressModalOpen && currentStep === "address" ? <AddressForm /> : ""}

      {/* <div>{cart.length > 0 && <PeopleAlsoBought />}</div> */}
    </div>
  );
};

export default CartPage;

// Component: Empty Cart
const EmptyCartUI = () => (
  <motion.div
    className="flex flex-col items-center justify-center space-y-4 py-16"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <ShoppingCart className="h-24 w-24 text-gray-300" />
    <h3 className="text-2xl font-semibold ">Your cart is empty</h3>
    <p className="text-gray-400">
      Looks like you {"haven't"} added anything to your cart yet.
    </p>
    <Link
      className="mt-4 rounded-md bg-emerald-500 px-6 py-2 text-white transition-colors hover:bg-emerald-600"
      to="/"
    >
      Start Shopping
    </Link>
  </motion.div>
);
