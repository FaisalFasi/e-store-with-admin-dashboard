import React from "react";
import { motion } from "framer-motion";
import ProgressBar from "../ProgressBar/ProgressBar";
import CartItem from "../CartItem/CartItem";
import OrderSummary from "../OrderSummary/OrderSummary";
import GiftCouponCard from "../GiftCouponCard/GiftCouponCard";
import PeopleAlsoBought from "../../products/PeopleAlsoBought/PeopleAlsoBought";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useCheckoutStore } from "../../../stores/useCheckoutStore";

// Component: Cart View
const CartView = ({ cart }) => {
  const { currentStep, setCurrentStep } = useCheckoutStore();

  return (
    <>
      <div className="mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8">
        {cart.length > 0 && (
          <motion.div
            className="mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <OrderSummary />
            <GiftCouponCard />
          </motion.div>
        )}
      </div>
    </>
  );
};

export default CartView;
