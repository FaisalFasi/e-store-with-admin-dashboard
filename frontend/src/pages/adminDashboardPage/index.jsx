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
import { useOrderStore } from "../../stores/useOrderStore";
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
  const { orders, getOrders } = useOrderStore();

  useEffect(() => {
    fetchAllProducts();
    getOrders();
  }, [fetchAllProducts, getOrders]);

  return (
    <section className="min-h-screen relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8">
        <motion.h1
          className="text-4xl font-bold mb-8 text-emerald-400 text-center"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          // initial={{ opacity: 0, y: -20 }}
          // animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Admin Dashboard
        </motion.h1>

        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-2 md:px-4 md:py-2 mx-2 rounded-md transition-colors duration-200 ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <tab.icon className="mr-2 h-5 w-5" />
              <span className=" text-xs font-bold sm:text-lg md:text-xl lg:text-xl whitespace-nowrap md:whitespace-normal py-2 md:py-0 ">
                {tab.label}
              </span>
            </button>
          ))}
        </motion.div>
        {activeTab === "create" && <CreateProductForm />}
        {activeTab === "products" && <ProductsList />}
        {activeTab === "analytics" && <AnalyticsTab />}
        {activeTab === "orders" && <OrdersTab orders={orders} />}
      </div>
    </section>
  );
};

export default AdminDashboardPage;
