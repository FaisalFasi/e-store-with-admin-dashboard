import React, { useState, useEffect } from "react";
import axiosBaseURL from "../../../lib/axios";
import { Users, Package, ShoppingCart, DollarSign } from "lucide-react";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { motion } from "framer-motion";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    totalSales: 0,
    totalRevenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmallScreen = windowWidth < 640;

  console.log("analyticsData", dailySalesData);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const response = await axiosBaseURL.get("/analytics");
        setAnalyticsData(response?.data?.analyticsData);
        setDailySalesData(response?.data?.dailySalesData);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  // Round revenue distribution data to 2 decimal places
  const revenueData = [
    {
      name: "Online Sales",
      value: parseFloat((analyticsData.totalRevenue * 0.6).toFixed(2)),
    },
    {
      name: "Retail Sales",
      value: parseFloat((analyticsData.totalRevenue * 0.3).toFixed(2)),
    },
    {
      name: "Other Sources",
      value: parseFloat((analyticsData.totalRevenue * 0.1).toFixed(2)),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto md:px-4 sm:px-6 lg:px-8">
      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {["Total Users", "Total Products", "Total Sales", "Total Revenue"].map(
          (title, i) => (
            <AnalyticsCard
              key={i}
              title={title}
              value={
                title === "Total Users"
                  ? analyticsData.users
                  : title === "Total Products"
                  ? analyticsData.products
                  : title === "Total Sales"
                  ? analyticsData.totalSales
                  : `$${analyticsData.totalRevenue}`
              }
              icon={[Users, Package, ShoppingCart, DollarSign][i]}
              color={`from-emerald-500 to-green-${i + 500}`}
            />
          )
        )}
      </div>

      {/* Line Chart for Sales Trends */}
      <motion.div className="rounded-lg bg-gray-800/60 md:p-6 shadow-lg mb-6">
        <p className="text-white text-lg mb-4 font-bold">
          Monthly Sales & Revenue
        </p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#D1D5DB" />
            <YAxis stroke="#D1D5DB" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#10B981"
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Donut/Pie Chart for Revenue Distribution */}
      {/* Donut/Pie Chart for Revenue Distribution */}
      <motion.div className="rounded-lg bg-gray-800/60 md:p-6 shadow-lg">
        <p className="text-white text-lg mb-4 font-bold">
          Revenue Distribution
        </p>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={revenueData}
              dataKey="value"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, value }) => `${name}: $${value.toFixed(2)}`}
              stroke="transparent"
              fill="#8884ff"
            >
              <Cell fill="#339867" /> {/* Orange for Online Sales */}
              <Cell fill="#d46746" /> {/* Dark Orange for Retail Sales */}
              <Cell fill="#cca941" /> {/* Yellow for Other Sources */}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Custom Legend */}
        <div className="mt-4 flex flex-wrap">
          {revenueData.map((item, index) => (
            <div
              key={`legend-${index}`}
              className="flex items-center mr-6 mt-2"
            >
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.fill }}
              ></div>
              <span className="ml-2 text-gray-300">
                {item.name}: ${item.value.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="flex justify-between items-center">
      <div className="z-10">
        <p className="text-emerald-300 text-sm mb-1 font-semibold">{title}</p>
        <h3 className="text-white text-3xl font-bold">{value}</h3>
      </div>
    </div>
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30" />
    <div className="absolute -bottom-4 -right-4 text-emerald-800 opacity-50">
      <Icon className="h-32 w-32" />
    </div>
  </motion.div>
);
export default AnalyticsTab;
