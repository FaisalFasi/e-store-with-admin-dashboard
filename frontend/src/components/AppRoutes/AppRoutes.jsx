import React, { useEffect, lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getUserData } from "@utils/getUserData.js";
import { useCartStore } from "@stores/useCartStore.js";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner.jsx";
import PurchaseSuccessPage from "@pages/purchaseSuccessPage/index.jsx";

//  Lazy Load Pages (Code Splitting)
const HomePage = lazy(() => import("@pages/homePage"));
const SignUpPage = lazy(() => import("@pages/signupPage"));
const LoginPage = lazy(() => import("@pages/loginPage"));
const AdminDashboardPage = lazy(() => import("@pages/adminDashboardPage"));
const CategoryPage = lazy(() => import("@pages/CategoryPage"));
const CartPage = lazy(() => import("@pages/cartPage"));
const PurchaseCancelPage = lazy(() => import("@pages/PurchaseCancelPage"));
const ResetPasswordPage = lazy(() =>
  import("@pages/resetPasswordPage/index.jsx")
);
const SingleProductPage = lazy(() =>
  import("@pages/singleProductPage/index.jsx")
);
const SingleOrderDetailPage = lazy(() =>
  import("@pages/singleOrderDetailPage/index.jsx")
);
// const PurchaseSuccessPage = lazy(() =>
//   import("@pages/purchaseSuccessPage/index")
// );

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
      <Routes>
        <Route
          path="*"
          element={
            //Wraped routes in Suspense to show a loading spinner while pages load
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route
                  path="/products/:productId"
                  element={<SingleProductPage />}
                />
                <Route
                  path="/order-detail/:orderId"
                  element={<SingleOrderDetailPage />}
                />
                <Route path="/" element={<HomePage />} />

                {/* User signup and login pages */}
                <Route
                  path="/signup"
                  element={!user ? <SignUpPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/login"
                  element={!user ? <LoginPage /> : <Navigate to="/" />}
                />

                {/* Admin dashboard page */}
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
                  element={
                    user ? <PurchaseSuccessPage /> : <Navigate to="/login" />
                  }
                />

                <Route
                  path="/purchase-cancel"
                  element={
                    user ? <PurchaseCancelPage /> : <Navigate to="/login" />
                  }
                />
              </Routes>
            </Suspense>
          }
        />
      </Routes>
    </div>
  );
};

export default AppRoutes;
