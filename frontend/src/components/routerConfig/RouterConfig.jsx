import { createBrowserRouter } from "react-router-dom";
import Layout from "../Layout/Layout";
import HomePage from "@/pages/homePage";
import SignUpPage from "@/pages/signupPage";
import LoginPage from "@/pages/loginPage";
import ResetPasswordPage from "@/pages/resetPasswordPage";
import SingleProductPage from "@/pages/singleProductPage";
import SingleOrderDetailPage from "@/pages/singleOrderDetailPage";
import AdminDashboardPage from "@/pages/adminDashboardPage";
import CategoryPage from "@/pages/CategoryPage";
import CartPage from "@/pages/cartPage";
import SuccessPage from "@/pages/successPage";
import PurchaseCancelPage from "@/pages/PurchaseCancelPage";
import ProtectedRoute from "@/lib/ProtectedRoute";

const RouterConfig = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/signup", element: <SignUpPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/reset-password", element: <ResetPasswordPage /> },
      { path: "/products/:productId", element: <SingleProductPage /> },
      { path: "/order-detail/:orderId", element: <SingleOrderDetailPage /> },
      {
        path: "/admin-dashboard",
        element: (
          <ProtectedRoute requiredRole={"admin"}>
            <AdminDashboardPage />
          </ProtectedRoute>
        ),
      },

      { path: "/category/:category", element: <CategoryPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/purchase-success", element: <SuccessPage /> },
      { path: "/purchase-cancel", element: <PurchaseCancelPage /> },
    ],
  },
]);
export default RouterConfig;

// will use this below later
// const PrivateRoute = ({ element }) => {
//   const { user } = getUserData(); // Custom hook for auth status
//   return user ? element : <Navigate to="/login" />;
// };

// const RouterConfig = createBrowserRouter([
//   {
//     path: "/",
//     element: <Layout />,
//     children: [
//       { index: true, element: <HomePage /> },

//       // Public Routes
//       { path: "signup", element: <SignUpPage /> },
//       { path: "login", element: <LoginPage /> },
//       // { path: "reset-password", element: <ResetPasswordPage /> },

//       // Products
//       {
//         path: "products/:productId",
//         element: <SingleProductPage />,
//         loader: async ({ params }) =>
//           fetch(`/api/products/${params.productId}`),
//       },
//       { path: "category/:category", element: <CategoryPage /> },

//       // Private Routes
//       {
//         path: "order-detail/:orderId",
//         element: <PrivateRoute element={<SingleOrderDetailPage />} />,
//       },
//       {
//         path: "cart",
//         element: <PrivateRoute element={<CartPage />} />,
//       },

//       // Admin Routes
//       {
//         path: "admin",
//         element: <PrivateRoute element={<AdminLayout />} />,
//         children: [
//           { path: "dashboard", element: <AdminDashboardPage /> },
//           { path: "orders", element: <AdminOrdersPage /> },
//           { path: "users", element: <AdminUsersPage /> },
//         ],
//       },

//       // Purchase Pages
//       { path: "purchase-success", element: <SuccessPage /> },
//       { path: "purchase-cancel", element: <PurchaseCancelPage /> },
//     ],
//   },
// ]);
