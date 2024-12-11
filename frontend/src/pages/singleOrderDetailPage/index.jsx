import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useOrderStore } from "../../stores/useOrderStore";

const SingleOrderDetailPage = () => {
  const { singleOrder: order, getOrderById } = useOrderStore();
  const { orderId } = useParams();

  useEffect(() => {
    const getOrderDetails = async (id) => {
      if (id) await getOrderById(id);
    };
    getOrderDetails(orderId);
  }, [orderId]);

  if (!order || !order._id)
    return <p className="text-center text-gray-500">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-lg shadow-md">
      <h2 className="text-3xl font-bold text-emerald-400 mb-6 text-center">
        Order Details
      </h2>

      <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-emerald-300 mb-4">
          General Information
        </h3>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Order ID:</strong> {order._id}
        </p>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Status:</strong> {order.status}
        </p>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Total Amount:</strong> $
          {order.totalAmount}
        </p>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Created At:</strong>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
        {order.cancellationReason && (
          <p className="text-red-400 mb-2">
            <strong className="font-semibold">Cancellation Reason:</strong>{" "}
            {order.cancellationReason}
          </p>
        )}
      </div>

      <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-emerald-300 mb-4">
          Payment Details
        </h3>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Method:</strong>{" "}
          {order.paymentDetails?.method || "N/A"}
        </p>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Status:</strong>{" "}
          {order.paymentDetails?.paymentStatus || "N/A"}
        </p>
      </div>

      <div className="bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h3 className="text-xl font-semibold text-emerald-300 mb-4">
          User Details
        </h3>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Name:</strong>{" "}
          {order.user?.name || "N/A"}
        </p>
        <p className="text-gray-300 mb-2">
          <strong className="font-semibold">Email:</strong>{" "}
          {order.user?.email || "N/A"}
        </p>
      </div>

      <div className="bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-xl font-semibold text-emerald-300 mb-4">
          Products
        </h3>
        <ul className="space-y-4">
          {order?.products?.map((product) => (
            <li key={product._id} className="bg-gray-700 p-4 rounded-lg">
              <p className="text-gray-300 mb-1">
                <strong className="font-semibold">Product ID:</strong>{" "}
                {product.product}
              </p>
              <p className="text-gray-300 mb-1">
                <strong className="font-semibold">Quantity:</strong>{" "}
                {product.quantity}
              </p>
              <p className="text-gray-300 mb-1">
                <strong className="font-semibold">Price:</strong> $
                {product.price}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SingleOrderDetailPage;
