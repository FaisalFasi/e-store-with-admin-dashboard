import React, { useEffect, useState } from "react";
import { useCartStore } from "../../../stores/useCartStore";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";
import axiosBaseURL from "../../../lib/axios";

const GiftCouponCard = () => {
  const [userInputCode, setUserInputCode] = useState("");
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const { coupon, isCouponApplied, applyCoupon, removeCoupon, getMyCoupon } =
    useCartStore();
  const [loading, setLoading] = useState(false);

  // Fetch available coupons when the component mounts
  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const response = await axiosBaseURL.get("/coupons/user-coupons");
        setAvailableCoupons(response.data || []);
      } catch (error) {
        console.error("Error fetching coupons:", error);
        toast.error("Failed to fetch coupons");
      }
    };

    fetchCoupons();
  }, []);

  // Update the input field when a coupon is applied
  useEffect(() => {
    if (coupon) setUserInputCode(coupon.code);
  }, [coupon]);

  // Handle applying a coupon
  const handleApplyCoupon = async () => {
    if (!userInputCode) {
      toast.error("Please enter a coupon code");
      return;
    }
    setLoading(true);
    await applyCoupon(userInputCode);
    setLoading(false);
  };

  // Handle removing a coupon
  const handleRemoveCoupon = async () => {
    setLoading(true);
    await removeCoupon();
    setUserInputCode("");
    setLoading(false);
  };

  // Handle selecting a coupon from the list
  const handleSelectCoupon = (code) => {
    setUserInputCode(code);
  };

  return (
    <motion.div
      className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="space-y-4">
        {/* Coupon Input Field */}
        <div>
          <label
            htmlFor="voucher"
            className="mb-2 block text-sm font-medium text-gray-300"
          >
            Do you have a voucher or gift card?
          </label>
          <input
            type="text"
            id="voucher"
            className="block w-full rounded-lg border border-gray-600 bg-gray-700 
            p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500 
            focus:ring-emerald-500"
            placeholder="Enter code here"
            value={userInputCode || ""}
            onChange={(e) => setUserInputCode(e.target.value)}
            required
          />
        </div>

        {/* Apply Coupon Button */}
        <motion.button
          type="button"
          className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleApplyCoupon}
          disabled={loading} // Disable button while loading
        >
          {loading ? "Applying..." : "Apply Code"}
        </motion.button>
      </div>

      {/* Applied Coupon Section */}
      {isCouponApplied && coupon && (
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-300">Applied Coupon</h3>
          <p className="mt-2 text-sm text-gray-400">
            {coupon.code} - {coupon.discountPercentage}% off
          </p>
          <motion.button
            type="button"
            className="mt-2 flex w-full items-center justify-center rounded-lg bg-red-600 
            px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none
             focus:ring-4 focus:ring-red-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRemoveCoupon}
            disabled={loading} // Disable button while loading
          >
            {loading ? "Removing..." : "Remove Coupon"}
          </motion.button>
        </div>
      )}

      {/* Available Coupons Section */}
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-300">
          Your Available Coupons:
        </h3>
        {availableCoupons.length > 0 ? (
          <ul className="mt-2 space-y-2">
            {availableCoupons.map((coupon) => (
              <li
                key={coupon._id}
                className="flex items-center justify-between rounded-lg bg-gray-700 p-3"
              >
                <div>
                  <p className="text-sm text-gray-300">{coupon.code}</p>
                  <p className="text-xs text-gray-400">
                    {coupon.discountPercentage}% off
                  </p>
                </div>
                <button
                  className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
                  onClick={() => handleSelectCoupon(coupon.code)}
                >
                  Apply
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-gray-400">No coupons available.</p>
        )}
      </div>
    </motion.div>
  );
};

export default GiftCouponCard;

// const GiftCouponCard = () => {
//   const [userInputCode, setUserInputCode] = useState("");
//   const [availableCoupons, setAvailableCoupons] = useState([]);
//   const { coupon, isCouponApplied, applyCoupon, removeCoupon, getMyCoupon } =
//     useCartStore();

//   // Fetch available coupons when the component mounts
//   useEffect(() => {
//     const fetchCoupons = async () => {
//       try {
//         const response = await axiosBaseURL.get("/coupons/user-coupons");
//         setAvailableCoupons(response.data || []);
//       } catch (error) {
//         console.error("Error fetching coupons:", error);
//         toast.error("Failed to fetch coupons");
//       }
//     };

//     fetchCoupons();
//   }, []);

//   // Update the input field when a coupon is applied
//   useEffect(() => {
//     if (coupon) setUserInputCode(coupon.code);
//   }, [coupon]);

//   // Handle applying a coupon
//   const handleApplyCoupon = () => {
//     if (!userInputCode) {
//       toast.error("Please enter a coupon code");
//       return;
//     }
//     applyCoupon(userInputCode);
//   };

//   // Handle removing a coupon
//   const handleRemoveCoupon = async () => {
//     await removeCoupon();
//     setUserInputCode("");
//   };

//   // Handle selecting a coupon from the list
//   const handleSelectCoupon = (code) => {
//     setUserInputCode(code);
//   };

//   return (
//     <motion.div
//       className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, delay: 0.2 }}
//     >
//       <div className="space-y-4">
//         {/* Coupon Input Field */}
//         <div>
//           <label
//             htmlFor="voucher"
//             className="mb-2 block text-sm font-medium text-gray-300"
//           >
//             Do you have a voucher or gift card?
//           </label>
//           <input
//             type="text"
//             id="voucher"
//             className="block w-full rounded-lg border border-gray-600 bg-gray-700
//             p-2.5 text-sm text-white placeholder-gray-400 focus:border-emerald-500
//             focus:ring-emerald-500"
//             placeholder="Enter code here"
//             value={userInputCode || ""}
//             onChange={(e) => setUserInputCode(e.target.value)}
//             required
//           />
//         </div>

//         {/* Apply Coupon Button */}
//         <motion.button
//           type="button"
//           className="flex w-full items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300"
//           whileHover={{ scale: 1.05 }}
//           whileTap={{ scale: 0.95 }}
//           onClick={handleApplyCoupon}
//         >
//           Apply Code
//         </motion.button>
//       </div>

//       {/* Applied Coupon Section */}
//       {isCouponApplied && coupon && (
//         <div className="mt-4">
//           <h3 className="text-lg font-medium text-gray-300">Applied Coupon</h3>
//           <p className="mt-2 text-sm text-gray-400">
//             {coupon.code} - {coupon.discountPercentage}% off
//           </p>
//           <motion.button
//             type="button"
//             className="mt-2 flex w-full items-center justify-center rounded-lg bg-red-600
//             px-5 py-2.5 text-sm font-medium text-white hover:bg-red-700 focus:outline-none
//              focus:ring-4 focus:ring-red-300"
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             onClick={handleRemoveCoupon}
//           >
//             Remove Coupon
//           </motion.button>
//         </div>
//       )}

//       {/* Available Coupons Section */}
//       <div className="mt-4">
//         <h3 className="text-lg font-medium text-gray-300">
//           Your Available Coupons:
//         </h3>
//         {availableCoupons.length > 0 ? (
//           <ul className="mt-2 space-y-2">
//             {availableCoupons.map((coupon) => (
//               <li
//                 key={coupon._id}
//                 className="flex items-center justify-between rounded-lg bg-gray-700 p-3"
//               >
//                 <div>
//                   <p className="text-sm text-gray-300">{coupon.code}</p>
//                   <p className="text-xs text-gray-400">
//                     {coupon.discountPercentage}% off
//                   </p>
//                 </div>
//                 <button
//                   className="rounded-lg bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-700"
//                   onClick={() => handleSelectCoupon(coupon.code)}
//                 >
//                   Apply
//                 </button>
//               </li>
//             ))}
//           </ul>
//         ) : (
//           <p className="mt-2 text-sm text-gray-400">No coupons available.</p>
//         )}
//       </div>
//     </motion.div>
//   );
// };
