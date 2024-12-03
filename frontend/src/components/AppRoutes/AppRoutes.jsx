import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "../../pages/homePage";
import SignUpPage from "../../pages/signupPage";
import LoginPage from "../../pages/loginPage";
import AdminDashboardPage from "../../pages/adminDashboardPage";
import CategoryPage from "../../pages/CategoryPage";
import CartPage from "../../pages/cartPage";
import PurchaseSuccessPage from "../../pages/PurchaseSuccessPage";
import PurchaseCancelPage from "../../pages/PurchaseCancelPage";
import { getUserData } from "../../utils/getUserData.js";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner.jsx";
import { useCartStore } from "../../stores/useCartStore.js";
import ResetPasswordPage from "../../pages/resetPasswordPage/index.jsx";

const AppRoutes = () => {
  const { user, checkAuth, checkingAuth } = getUserData();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    if (!user && checkingAuth) checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;
  return (
    <div className="py-24 min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      {/* <BackgroundGradient /> */}
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        <Route path="/" element={<HomePage />} />
        {/* user signup and login pages */}
        <Route
          path="/signup"
          element={!user ? <SignUpPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to={"/"} />}
        />
        {/* admin dashboard page */}
        <Route
          path="/admin-dashboard"
          element={
            user?.role === "admin" ? (
              <AdminDashboardPage />
            ) : (
              <Navigate to={user ? "/" : "/login"} />
            )
          }
        />
        <Route path="/category/:category" element={<CategoryPage />} />

        <Route
          path="/cart"
          element={user ? <CartPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/purchase-success"
          element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/purchase-cancel"
          element={user ? <PurchaseCancelPage /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default AppRoutes;

const BackgroundGradient = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
      </div>
    </div>
  );
};
