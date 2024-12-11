import React, { useState, useEffect } from "react";
import { useOrderStore } from "../../../stores/useOrderStore";
import { useNavigate } from "react-router-dom";

const OrdersTab = () => {
  const { orders, getOrders } = useOrderStore();
  const [filterBy, setFilterBy] = useState("this_month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  const handleFilterChange = async (e) => {
    const selectedFilter = e.target.value;
    setFilterBy(selectedFilter);
    const fetchedOrders = await getOrders(selectedFilter, "", "");
    console.log(`Fetched orders for ${selectedFilter}:`, fetchedOrders);
  };

  const handleDateRangeSubmit = async () => {
    if (startDate && endDate) {
      console.log("Applying custom date range...");
      const fetchedOrders = await getOrders("custom", startDate, endDate);
      console.log(`Fetched orders for custom range:`, fetchedOrders);
    } else {
      console.log("Please select both start and end dates.");
    }
  };

  const viewOrderDetails = (orderId) => {
    console.log(`View details for order: ${orderId}`);
    navigate(`/order-detail/${orderId}`);
  };

  useEffect(() => {
    handleFilterChange({ target: { value: filterBy } });
  }, [filterBy]);

  return (
    <div className="bg-gray-900 rounded-lg p-6 text-gray-300">
      <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">
        Orders
      </h2>

      <div className="flex mb-4 w-full md:w-auto md:gap-4 items-center">
        <label className="font-semibold">Filter By:</label>
        <select
          value={filterBy}
          onChange={handleFilterChange}
          className="ml-8 md:ml-5 p-2.5 bg-gray-800 text-gray-300 rounded border border-gray-700"
        >
          <option value="today">Today</option>
          <option value="yesterday">Yesterday</option>
          <option value="this_week">This Week</option>
          <option value="this_month">This Month</option>
          <option value="previous_month">Previous Month</option>
          <option value="this_year">This Year</option>
          <option value="previous_year">Previous Year</option>
        </select>
      </div>
      <div className="mb-6 flex flex-wrap gap-4 items-center justify-start">
        <div className="flex items-center md:w-auto ">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="ml-6 p-2 bg-gray-800 text-gray-300 rounded border border-gray-700"
          />
        </div>
        <div className="flex items-center md:w-auto  ">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="ml-8 p-2 bg-gray-800 text-gray-300 rounded border border-gray-700"
          />
        </div>
        <button
          onClick={handleDateRangeSubmit}
          className="bg-emerald-500 text-white px-4 py-2 rounded shadow hover:bg-emerald-600"
        >
          Apply
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-700 hover:shadow-xl transition-shadow duration-300"
            >
              <p className="mb-2">
                <strong className="font-semibold">Order ID:</strong> {order._id}
              </p>
              <p className="mb-2">
                <strong className="font-semibold">Status:</strong>{" "}
                {order.status}
              </p>
              <p className="mb-4">
                <strong className="font-semibold">Total Amount:</strong> $
                {order.totalAmount}
              </p>
              <button
                onClick={() => viewOrderDetails(order._id)}
                className="bg-blue-500 text-white rounded px-4 py-2 shadow hover:bg-blue-600"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-6 text-gray-500 text-center">
          No orders found for the selected filter.
        </p>
      )}
    </div>
  );
};

export default OrdersTab;
