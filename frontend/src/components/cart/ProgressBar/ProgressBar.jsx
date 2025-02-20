import React from "react";
import { useCheckoutStore } from "../../../stores/useCheckoutStore";

const ProgressBar = () => {
  const { currentStep } = useCheckoutStore(); // Ensure this is subscribed correctly from the store

  const steps = ["cart", "address", "checkout"];
  const currentStepIndex = steps.indexOf(currentStep); // Get the current index of the step

  return (
    <div className="relative pt-1">
      <div className="flex mb-2 items-center justify-between">
        <div className="w-1/3 text-center text-sm font-medium">Cart</div>
        <div className="w-1/3 text-center text-sm font-medium">Address</div>
        <div className="w-1/3 text-center text-sm font-medium">Checkout</div>
      </div>

      <div className="flex mb-2 items-center justify-between">
        {steps.map((stepLabel, index) => (
          <div
            key={index}
            className={`w-1/3 h-2 rounded-full transition-all duration-300 ${
              index <= currentStepIndex ? "bg-emerald-500" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
