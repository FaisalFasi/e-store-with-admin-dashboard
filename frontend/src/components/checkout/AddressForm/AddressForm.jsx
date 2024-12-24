import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useCartStore } from "../../../stores/useCartStore";
import { useCheckoutStore } from "../../../stores/useCheckoutStore";

const AddressForm = () => {
  const { saveShippingAddress, cart, coupon } = useCartStore();
  const {
    handlePayment,
    address,
    setAddress,
    setCurrentStep,
    errors,
    setErrors,
  } = useCheckoutStore();

  useEffect(() => {
    localStorage.setItem("address", JSON.stringify(address));
  }, [address]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress({ [name]: value });
  };

  const validateForm = () => {
    const newErrors = {};
    // Basic validation
    Object.keys(address).forEach((field) => {
      if (!address[field]) {
        newErrors[field] = `${field} is required`;
      }
    });
    // Phone number validation (basic check)
    if (address.phoneNumber && !/^\d{11}$/.test(address.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must be 11 digits";
    }
    // Postal code validation (basic check for numeric values)
    if (address.postalCode && !/^\d{5}$/.test(address.postalCode)) {
      newErrors.postalCode = "Postal code must be 5 digits";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setCurrentStep("address");
      handleSaveShippingAddress();
      // paymeent function is called from the useCheckoutStore.js
      handlePayment(cart, coupon);
    }
  };

  const handleSaveShippingAddress = async () => {
    localStorage.setItem("address", JSON.stringify(address));
    await saveShippingAddress(address);
  };

  return (
    <section className="min-h-screen relative overflow-hidden rounded-lg">
      <div className="flex w-full z-10 container ">
        {/* Form */}
        <motion.form
          className=" bg-gray-800 shadow-lg rounded-lg p-4 mb-8 w-full "
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          onSubmit={handleSubmit}
        >
          {Object.keys(address).map((field) => (
            <motion.div
              key={field}
              className="mb-4"
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.8,
                delay: 0.1 * Object.keys(address).indexOf(field),
              }}
            >
              <label
                htmlFor={field}
                className="block text-sm font-medium text-gray-300 capitalize"
              >
                {field}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={address[field]}
                onChange={handleInputChange}
                className={`mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors[field] ? "border-red-500" : ""
                }`}
                placeholder={`Enter your ${field}`}
              />
              {errors[field] && (
                <p className="text-sm text-red-500 mt-1">{errors[field]}</p>
              )}
            </motion.div>
          ))}
          <motion.div className="flex gap-2 flex-wrap md:flex-nowrap">
            <motion.button
              type="button"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-md transition-all duration-200 mt-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              onClick={() => setCurrentStep("cart")}
            >
              Go Back
            </motion.button>
            <motion.button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-md transition-all duration-200 mt-4"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              Proceed to Payment
            </motion.button>
          </motion.div>
        </motion.form>
      </div>
    </section>
  );
};

export default AddressForm;
