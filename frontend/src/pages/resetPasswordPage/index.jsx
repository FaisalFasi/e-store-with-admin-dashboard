import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Loader, CheckCircle } from "lucide-react"; // Icons for password, loader, and success
import toast from "react-hot-toast";
import axiosBaseURL from "../../lib/axios";
import { useLocation, useNavigate } from "react-router-dom";

const ResetPasswordPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Get the token from the query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // Redirect or show error if token is missing
  if (!token) {
    navigate("/error"); // Redirect to an error page
    return null;
  }

  const navigetToLogin = () => {
    navigate("/login");
  };
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const { password, confirmPassword } = Object.fromEntries(formData);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      console.log("resetToken:", token);
      const res = await axiosBaseURL.post(`/auth/reset-password`, {
        token: token, // Include the token in the body
        newPassword: password,
      });
      console.log("res:", res);
      toast.success(res?.data?.message || "Password reset successfully!");

      setMessage(res?.data?.message || "Password has been reset successfully.");

      setTimeout(() => navigetToLogin(), 2000); // Optionally close the modal after success
    } catch (error) {
      console.log("error:", error?.response?.data?.message || error);
      toast.error(
        error?.response?.data?.message || "Error resetting password."
      );
      setMessage("Error resetting password.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 z-50">
      <motion.div
        className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 w-full sm:max-w-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-center text-3xl font-extrabold text-emerald-400 mb-6">
          Reset Password
        </h2>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-300"
              >
                New Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  type="password"
                  name="password"
                  required
                  //   value={formData.password}
                  //   onChange={onChange}
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            {/* Confirm Password Input */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-300"
              >
                Confirm Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  required
                  //   value={formData.confirmPassword}
                  //   onChange={onChange}
                  className="block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {/* Submit Button */}
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
                  Resetting...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  Reset Password
                </>
              )}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-center text-sm text-gray-400">{message}</p>
          )}

          <div className="flex justify-center mt-4">
            <button
              className="text-sm font-medium text-gray-400 hover:text-gray-300"
              onClick={() => {
                navigetToLogin();
                setMessage("");
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

export default ResetPasswordPage;
