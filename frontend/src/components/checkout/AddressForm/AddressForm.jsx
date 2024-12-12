import React, { useState } from "react";
import { motion } from "framer-motion";

const AddressForm = ({ onSubmit }) => {
  const [address, setAddress] = useState({
    fullName: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    phoneNumber: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(address);
  };

  return (
    <section className="min-h-screen relative overflow-hidden bg-gray-100 py-8">
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Title */}
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Enter Your Address
        </motion.h1>

        {/* Form */}
        <motion.form
          className="bg-white shadow-lg rounded-lg p-6 max-w-lg mx-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
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
                className="block text-gray-700 font-medium mb-1 capitalize"
              >
                {field}
              </label>
              <input
                type="text"
                id={field}
                name={field}
                value={address[field]}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder={`Enter your ${field}`}
              />
            </motion.div>
          ))}

          <motion.button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-md transition-all duration-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            Proceed to Payment
          </motion.button>
        </motion.form>
      </div>
    </section>
  );
};

export default AddressForm;
