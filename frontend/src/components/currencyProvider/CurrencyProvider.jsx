import React, { useEffect } from "react";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { toast } from "react-hot-toast";

export function CurrencyProvider({ children }) {
  const { updateExchangeRates, error } = useCurrencyStore();

  useEffect(() => {
    updateExchangeRates();

    // Update exchange rates every hour
    const intervalId = setInterval(() => {
      updateExchangeRates();
    }, 3600000); // 1 hour

    return () => clearInterval(intervalId);
  }, [updateExchangeRates]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to update currency exchange rates", {
        description: "Using last known rates. Will retry later.",
      });
    }
  }, [error]);

  return <>{children}</>;
}
