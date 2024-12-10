import React from "react";
import { useOrderStore, ORDER_STATUSES } from "../../../stores/useOrderStore";

const OrderItem = () => {
  const [status, setStatus] = useState("Pending");

  const { updateOrderStatus, sendOrderUpdateEmail } = useOrderStore();

  const handleCheckboxChange = async (newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      setStatus(newStatus);

      // Send email notification automatically
      await sendOrderUpdateEmail(email, newStatus);

      alert(
        `Order status updated to ${newStatus} and email notification sent.`
      );
    } catch (error) {
      console.error("Order update error", error);
      alert(`Failed to update order to ${newStatus}`);
    }
  };

  return (
    <div>
      {ORDER_STATUSES.map((orderStatus) => (
        <label key={orderStatus} className="status-label">
          <input
            type="checkbox"
            checked={status === orderStatus}
            onChange={() => handleCheckboxChange(orderStatus)}
          />
          {orderStatus}
        </label>
      ))}
    </div>
  );
};

export default OrderItem;
