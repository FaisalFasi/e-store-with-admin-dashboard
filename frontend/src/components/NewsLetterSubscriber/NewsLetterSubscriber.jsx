import React from "react";
import { motion } from "framer-motion";
import { Mail, Loader, Check } from "lucide-react"; // Icons for email, loader, and success
import toast from "react-hot-toast";
import { useNewsLetterStore } from "../../stores/useNewsLetterStore";

const NewsLetterSubscriber = ({ setShowSubscribePopup }) => {
  const { subscribeToNewsletter, loading } = useNewsLetterStore();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { email } = Object.fromEntries(formData);

    console.log("formData.email:", email);
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    console.log("Subscribing email:", email);

    const result = await subscribeToNewsletter(email);
    console.log("result:", result);
    if (result.success) {
      e.target.reset();
      setShowSubscribePopup(); // Optionally close popup after success
    }
  };

  return (
    <div className="fixed w-screen h-screen top-0 left-0 flex justify-center bg-black bg-opacity-50 z-50 ">
      <motion.div
        className="h-fit bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-center text-3xl font-extrabold text-emerald-400 mb-6">
          Subscribe to Our Newsletter
        </h2>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  type="email"
                  name="email"
                  required
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-150 ease-in-out disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader
                    className="mr-2 h-5 w-5 animate-spin"
                    aria-hidden="true"
                  />
                  Subscribing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-5 w-5" aria-hidden="true" />
                  Subscribe
                </>
              )}
            </button>
          </form>

          <div className="flex justify-center mt-4">
            <button
              className="text-sm font-medium text-gray-400 hover:text-gray-300"
              onClick={() => {
                setShowSubscribePopup();
              }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NewsLetterSubscriber;
