import React from "react";

const OrdersTab = ({ orders }) => {
  const viewOrderDetails = (orderId) => {
    console.log("View order details for order ID:", orderId);
    window.location.href = `/dashboard/orders/${orderId}`;
  };
  return (
    <div>
      <h2>Orders</h2>
      {orders.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order._id} className="p-4 border rounded">
              <p>
                <strong>Order ID:</strong> {order._id}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Total Amount:</strong> ${order.totalAmount}
              </p>
              <button
                onClick={() => viewOrderDetails(order._id)}
                className="btn mt-2 bg-blue-500 text-white"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );
};

export default OrdersTab;
