import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import { Toaster } from "react-hot-toast";
import { useUserStore } from "./stores/useUserStore";
import { useEffect } from "react";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";

// pages import
import SignUpPage from "./pages/signupPage";
import AdminDashboardPage from "./pages/adminDashboardPage";
import HomePage from "./pages/homePage";
import LoginPage from "./pages/loginPage";
import CategoryPage from "./pages/CategoryPage";
import CartPage from "./pages/cartPage";
import { useCartStore } from "./stores/useCartStore";
import PurchaseSuccessPage from "./pages/PurchaseSuccessPage";
import PurchaseCancelPage from "./pages/PurchaseCancelPage";

function App() {
  const { user, checkAuth, checkingAuth } = useUserStore();
  const { getCartItems } = useCartStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    getCartItems();
  }, [getCartItems, user]);

  if (checkingAuth) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.3)_0%,rgba(10,80,60,0.2)_45%,rgba(0,0,0,0.1)_100%)]" />
        </div>
      </div>
      <div className="relative z-50 pt-24 sm:pt-20">
        <Navbar />

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
            // element={user ? <PurchaseSuccessPage /> : <Navigate to="/login" />}
            element={user && <PurchaseSuccessPage />}
          />
          <Route
            path="/purchase-cancel"
            element={user && <PurchaseCancelPage />}
          />
        </Routes>
      </div>
      <Toaster position="bottom-right" />
    </div>
  );
}

export default App;
