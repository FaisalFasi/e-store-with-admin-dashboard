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
import { getUser } from "../../utils/getUser.js";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner.jsx";
import { useCartStore } from "../../stores/useCartStore.js";

const AppRoutes = () => {
  const { user, checkAuth, checkingAuth } = getUser();
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
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <Routes>
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
