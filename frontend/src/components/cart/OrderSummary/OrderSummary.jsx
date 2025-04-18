import React from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../../../stores/useCartStore";
import { Link } from "react-router-dom";
import { useCheckoutStore } from "../../../stores/useCheckoutStore";
import { usePrice } from "@/utils/currency/currency";

const OrderSummary = () => {
  const { subTotal, total, coupon, isCouponApplied, savings } = useCartStore();

  const { setCurrentStep, openAddressModal } = useCheckoutStore();
  const { formatPrice } = usePrice();

  // Format values for display
  const formattedSubtotal = subTotal ? formatPrice(subTotal) : "0.00";
  const formattedTotal = total ? formatPrice(total) : "0.00";
  const formattedSavings = savings ? formatPrice(savings) : "0.00";

  const hanldeProceedToAddress = () => {
    setCurrentStep("address");
    openAddressModal();
  };

  console.log("Order Summary:", {
    subTotal,
    total,
    coupon,
    isCouponApplied,
    savings,
    formattedSubtotal,
    formattedTotal,
    formattedSavings,
  });

  return (
    <motion.div
      className=" space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <p className="text-xl font-semibold text-emerald-400">Order summary</p>
      <div className="space-y-4">
        <div className="space-y-2">
          {/* Original Price */}
          <dl className="flex items-center justify-between gap-4">
            <dt className="text-base font-normal text-gray-300">
              Original price
            </dt>
            <dd className="text-base font-medium text-white">
              {formattedSubtotal}
            </dd>
          </dl>

          {/* Savings (Discount) */}
          {isCouponApplied && savings > 0 && (
            <dl className="flex items-center justify-between gap-4">
              <dt className="text-base font-normal text-gray-300">Savings</dt>
              <dd className="text-base font-medium text-emerald-400">
                -{formattedSavings}
              </dd>
            </dl>
          )}

          {/* Coupon Discount */}
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

          {/* Total */}
          <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
            <dt className="text-base font-bold text-white">Total</dt>
            <dd className="text-base font-bold text-emerald-400">
              {formattedTotal}
            </dd>
          </dl>
        </div>

        {/* Checkout Button */}
        <motion.button
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => hanldeProceedToAddress()}
        >
          Proceed to checkout
        </motion.button>

        {/* Continue Shopping Link */}
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-normal text-gray-400">or</span>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderSummary;
