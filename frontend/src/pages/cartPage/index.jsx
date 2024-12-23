import React, { useCallback, useState } from "react";
import { useCartStore } from "../../stores/useCartStore";
import AddressForm from "../../components/checkout/AddressForm/AddressForm";
import CartView from "../../components/cart/CartView/CartView";
import Modal from "../../components/shared/Modal/Modal";
import LoadingSpinner from "../../components/shared/LoadingSpinner/LoadingSpinner";

const CartPage = () => {
  const { cart } = useCartStore();
  const [step, setStep] = useState("cart");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const openModal = () => setIsAddressModalOpen(true);
  const closeModal = () => {
    setIsAddressModalOpen(false);
    setStep("cart");
  };
  const handleAddressSubmit = () => {
    setStep("checkout"); // Proceed to Stripe Checkout
  };

  const handleContentClick = (e) => {
    setStep("cart"); // Go back to cart view
  };

  return (
    <div className="relative z-10 container mx-auto px-4">
      <CartView
        cart={cart}
        onProceed={() => {
          setStep("address");
          openModal();
        }}
        step={step}
      />
      {step === "address" && (
        <Modal
          isOpen={isAddressModalOpen}
          onClose={closeModal}
          title="Enter Shipping Address"
        >
          <AddressForm onSubmit={handleAddressSubmit} />
        </Modal>
      )}
      {step === "checkout" && (
        <div className="fixed top-0 right-0 w-full h-full text-white p-4">
          Proceeding to checkout...
          {/* <LoadingSpinner /> */}
        </div>
      )}
    </div>
  );
};

export default CartPage;
