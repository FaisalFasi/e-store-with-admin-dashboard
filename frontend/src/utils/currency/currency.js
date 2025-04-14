import { useCurrencyStore } from "@/stores/useCurrencyStore";
import { useEffect } from "react";

/**
 * Converts price from USD cents to the target currency
 */
export function convertPrice(priceInUsdCents, targetCurrency) {
  return (priceInUsdCents / 100) * targetCurrency.exchangeRate;
}

/**
 * Formats a price with the correct symbol and decimal places
 */
export function formatPrice(priceInUsdCents, currency) {
  const convertedPrice = convertPrice(priceInUsdCents, currency);

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: currency.decimalPlaces,
    maximumFractionDigits: currency.decimalPlaces,
  }).format(convertedPrice);
}

/**
 * Custom hook for converting prices
 */
export function usePrice() {
  const { selectedCurrency, currencies, updateExchangeRates, isLoading } =
    useCurrencyStore();

  // Make sure we have the latest exchange rates
  useEffect(() => {
    updateExchangeRates();
  }, [updateExchangeRates]);

  return {
    isLoading,
    formatPrice: (priceInUsdCents) =>
      formatPrice(priceInUsdCents, selectedCurrency),
    convertPrice: (priceInUsdCents) =>
      convertPrice(priceInUsdCents, selectedCurrency),
    selectedCurrency,
    currencies,
  };
}
