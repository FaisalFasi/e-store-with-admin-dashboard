import React, { useEffect, useState } from "react";
import {
  BarChart,
  PlusCircle,
  ShoppingBag,
  ShoppingBasket,
} from "lucide-react"; // Added Tag for Categories icon
import AnalyticsTab from "../../components/dashboard/AnalyticsTab/AnalyticsTab";
import ProductsList from "../../components/products/ProductsList/ProductsList";
import CreateProductForm from "../../components/products/CreateProductForm/CreateProductForm";
import OrdersTab from "../../components/orders/OrdersTab/OrdersTab";
import CreateCategoryForm from "../../components/dashboard/CreateCategoryForm/CreateCategoryForm"; // Added CreateCategoryForm

import { motion } from "framer-motion";
import { useProductStore } from "../../stores/useProductStore";
import { useCategoryStore } from "../../stores/useCategoryStore";
import { getUserData } from "../../utils/getUserData";
import { Navigate } from "react-router-dom";

const tabs = [
  { id: "create", label: "Product", icon: PlusCircle },
  { id: "categories", label: "Categories", icon: PlusCircle }, // Added Categories tab
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "orders", label: "Orders", icon: ShoppingBag },
  { id: "analytics", label: "Analytics", icon: BarChart },
];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const { fetchAllProducts } = useProductStore();
  const { getAllCategories } = useCategoryStore(); // Added getAllCategories
  const { user } = getUserData();

  useEffect(() => {
    fetchAllProducts();
    getAllCategories(); // Added getAllCategories
  }, [fetchAllProducts]);

  if (!user.role === "admin") {
    return <Navigate to={user ? "/" : "/login"} />;
  }

  return (
    <section className="min-h-screen bg-gray-900 relative overflow-hidden">
      <div className="relative z-10 container mx-auto p-4 md:px-6 md:py-10">
        {/* Dashboard Title */}
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        {/* Navigation Buttons */}
        <motion.div
          className="flex flex-wrap justify-center mb-8 gap-2  md:justify-center"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-36 md:w-44 flex items-center justify-center p-2 md:p-4 rounded-md text-white font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } md:text-lg`}
            >
              <tab.icon className="mr-2 h-6 w-6" />
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <div className="flex items-center justify-center w-full p-0 m-0 rounded-lg shadow-lg">
          {activeTab === "create" && <CreateProductForm />}
          {activeTab === "products" && <ProductsList />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "orders" && <OrdersTab />}
          {activeTab === "categories" && <CreateCategoryForm />}{" "}
          {/* Show CreateCategoryForm for categories */}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
