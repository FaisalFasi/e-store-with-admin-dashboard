import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCartStore } from "../../../stores/useCartStore";
import { MoveRight } from "lucide-react";
import axiosBaseURL from "../../../lib/axios";
import { loadStripe } from "@stripe/stripe-js";

export const OrderSummary = ({ onProceed }) => {
  const stripePromise = loadStripe(
    "pk_test_51QHTGCGL2ttkOT4rL7vt5eQHDnaeimKzWDxjcQ89KJjjZ6JMt1GlHOXkrQDZODVxI30k2331AfVvRyjQAUM2sK5L00WGfGGhzq"
  );

  const { total, subTotal, coupon, isCouponApplied, cart } = useCartStore();

  const savings = subTotal && total ? subTotal - total : 0;

  const formattedSubtotal = subTotal ? subTotal.toFixed(2) : "0.00";
  const formattedTotal = total ? total.toFixed(2) : "0.00";
  const formattedSavings = savings ? savings.toFixed(2) : "0.00";

  const handlePayment = async () => {
    const stripe = await stripePromise;
    const res = await axiosBaseURL.post("/payments/create-checkout-session", {
      products: cart,
      couponCode: coupon ? coupon.code : null,
    });

    const session = res?.data;
    const result = await stripe.redirectToCheckout({
      sessionId: session.id,
    });

    if (result.error) {
      console.error("Error:", result.error);
    }
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
          onClick={onProceed}
          // onClick={handlePayment}
        >
          Proceed to Checkout
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
