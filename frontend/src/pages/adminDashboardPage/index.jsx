import React, { useEffect, useState } from "react";
import {
  BarChart,
  PlusCircle,
  ShoppingBag,
  ShoppingBasket,
} from "lucide-react";
import AnalyticsTab from "../../components/dashboard/AnalyticsTab/AnalyticsTab";
import ProductsList from "../../components/products/ProductsList/ProductsList";
import CreateProductForm from "../../components/products/CreateProductForm/CreateProductForm";

import { motion } from "framer-motion";
import { useProductStore } from "../../stores/useProductStore";
import OrdersTab from "../../components/orders/OrdersTab/OrdersTab";

const tabs = [
  { id: "create", label: "Create Product", icon: PlusCircle },
  { id: "products", label: "Products", icon: ShoppingBasket },
  { id: "analytics", label: "Analytics", icon: BarChart },
  { id: "orders", label: "Orders", icon: ShoppingBag },
];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const { fetchAllProducts } = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <section className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
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
          className="flex flex-wrap justify-center mb-8 space-x-2 space-y-2 md:space-y-0 md:justify-center"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center px-4 py-2 rounded-md text-white font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-600"
                  : "bg-gray-700 hover:bg-gray-600"
              } md:text-lg md:px-6 md:py-3`}
            >
              <tab.icon className="mr-2 h-6 w-6" />
              <span>{tab.label}</span>
            </button>
          ))}
        </motion.div>

        {/* Content Area */}
        <div className="p-2 md:p-4 bg-gray-800 rounded-lg shadow">
          {activeTab === "create" && <CreateProductForm />}
          {activeTab === "products" && <ProductsList />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "orders" && <OrdersTab />}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
