import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CURRENCIES = {
  USD: {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    exchangeRate: 1, // Base currency
    decimalPlaces: 2,
  },
  EUR: {
    code: "EUR",
    symbol: "€",
    name: "Euro",
    exchangeRate: 0, // Will be updated from API
    decimalPlaces: 2,
  },
  GBP: {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    exchangeRate: 0, // Will be updated from API
    decimalPlaces: 2,
  },
  PKR: {
    code: "PKR",
    symbol: "₨",
    name: "Pakistani Rupee",
    exchangeRate: 0, // Will be updated from API
    decimalPlaces: 0, // PKR typically doesn't use decimals in display
  },
};

// here persist is used to store the state in local storage
// so that the selected currency and exchange rates persist across page reloads
// and sessions
// this is useful for user experience, as users don't have to select their currency every time they visit the site
// and the exchange rates are updated automatically
// what will happen is i dont use persist
// the selected currency and exchange rates will be lost when the page is reloaded
export const useCurrencyStore = create(
  persist(
    (set, get) => ({
      selectedCurrency: CURRENCIES.USD,
      currencies: CURRENCIES,
      lastUpdated: null,
      isLoading: false,
      error: null,

      selectCurrency: (code) => {
        const currency = get().currencies[code];
        if (currency) {
          set({ selectedCurrency: currency });
        }
      },

      updateExchangeRates: async () => {
        const currentTime = Date.now();
        const lastUpdated = get().lastUpdated;

        // Only update if it's been more than 1 hour since last update
        if (lastUpdated && currentTime - lastUpdated < 3600000) {
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await fetch(`https://open.er-api.com/v6/latest/USD`);

          if (!response.ok) {
            throw new Error("Failed to fetch exchange rates");
          }

          const data = await response.json();

          if (data.rates) {
            const updatedCurrencies = { ...get().currencies };

            // Update each currency with the latest exchange rate
            Object.keys(updatedCurrencies).forEach((code) => {
              if (code !== "USD" && data.rates[code]) {
                updatedCurrencies[code] = {
                  ...updatedCurrencies[code],
                  exchangeRate: data.rates[code],
                };
              }
            });

            set({
              currencies: updatedCurrencies,
              lastUpdated: currentTime,
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Error updating exchange rates:", error);
          set({
            error: error.message || "Unknown error",
            isLoading: false,
          });
        }
      },
    }),
    {
      name: "currency-store",
    }
  )
);
