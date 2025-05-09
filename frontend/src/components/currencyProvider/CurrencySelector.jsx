import React from "react";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
import InputField from "../shared/InputField/InputField";

export function CurrencySelector() {
  const { selectedCurrency, currencies, selectCurrency, isLoading } =
    useCurrencyStore();

  return (
    <div className="relative">
      <InputField
        type="select"
        name="selected currency"
        id="selected currency"
        className="bg-gray-600 text-center rounded-full mb-0 border-none "
        disabled={isLoading}
        value={selectedCurrency.code}
        onChange={(e) => selectCurrency(e.target.value)}
        options={Object.values(currencies).map((currency) => ({
          value: currency.code,
          label: `${currency.symbol} ${currency.code}`,
        }))}
      />

      {isLoading && (
        <div className="absolute right-2 top-2 w-3 h-3 rounded-full border-2 border-t-transparent border-primary animate-spin" />
      )}
    </div>
  );
}
