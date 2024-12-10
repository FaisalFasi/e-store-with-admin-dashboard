import React from "react";
import { useOrderStore } from "../../stores/useOrderStore";

const SingleOrderDetailPage = ({ orderId }) => {
  const { singleOrder: order, getOrderById } = useOrderStore();

  useEffect(() => {
    const getOrderDetails = async (id) => {
      if (id) await getOrderById(id);
    };
    getOrderDetails(orderId);
  }, [orderId]);

  if (!order) return <p>Loading...</p>;

  return (
    <div>
      <h2>Order Details</h2>
      <p>
        <strong>Order ID:</strong> {order._id}
      </p>
      <p>
        <strong>Status:</strong> {order.status}
      </p>
      <p>
        <strong>Total Amount:</strong> ${order.totalAmount}
      </p>
      <p>
        <strong>Products:</strong>
      </p>
      <ul>
        {order.products.map((product) => (
          <li key={product.product._id}>
            {product.product.name} - ${product.product.price}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SingleOrderDetailPage;
