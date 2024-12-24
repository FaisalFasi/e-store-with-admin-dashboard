import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCartStore } from "../../../stores/useCartStore";
import { MoveRight } from "lucide-react";
import axiosBaseURL from "../../../lib/axios";
import { loadStripe } from "@stripe/stripe-js";
import { useCheckoutStore } from "../../../stores/useCheckoutStore";

export const OrderSummary = () => {
  const { total, subTotal, coupon, isCouponApplied } = useCartStore();
  const { openAddressModal, resetToAddress } = useCheckoutStore();

  const savings = subTotal && total ? subTotal - total : 0;

  const formattedSubtotal = subTotal ? subTotal.toFixed(2) : "0.00";
  const formattedTotal = total ? total.toFixed(2) : "0.00";
  const formattedSavings = savings ? savings.toFixed(2) : "0.00";

  const handleSubmit = async () => {
    openAddressModal();
    resetToAddress();
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-emerald-400">Order summary</p>
      {/* space-y-4 means that the children of the div will have a space of 1rem
      between them. */}
      {/* and space-y-2 means that the children of the div will have a space of 0.5rem */}
      <div className="space-y-4">
        <div className="space-y-2">
          {/* dl means definition list. It is used to display a list of terms and their definitions. */}
          <dl className="flex items-center justify-between gap-4">
            {/* dt means definition term. It is used to define the term name. */}
            <dt className="text-base font-normal text-gray-300">
              Original price
            </dt>
            {/* dd means definition description. It is used to define the term description. */}
            <dd className="text-base font-medium text-white">
              ${formattedSubtotal}
            </dd>
          </dl>

          {savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-emerald-400">
                -${formattedSavings}
              </dd>
            </dl>
          )}

          {coupon && isCouponApplied && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">
                Coupon ({coupon.code})
              </dt>
              <dd className="text-base font-medium text-emerald-400">
                -{coupon.discountPercentage}%
              </dd>
            </dl>
          )}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-emerald-400">
              ${formattedTotal}
            </dd>
          </dl>
        </div>

        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleSubmit}
        >
          Proceed to checkout
        </motion.button>

        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
          >
            Continue Shopping
            <MoveRight size={16} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
export default OrderSummary;
