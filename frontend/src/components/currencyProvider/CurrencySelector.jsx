import React from "react";
import { useCurrencyStore } from "@/stores/useCurrencyStore";
// import {
//   Select,
//   SelectContent,
//   SelectGroup,
//   SelectItem,
//   SelectLabel,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

export function CurrencySelector() {
  const { selectedCurrency, currencies, selectCurrency, isLoading } =
    useCurrencyStore();

  return (
    <div className="relative">
      {/* <label> */}
      <select
        name="selected currency"
        id="selected currency"
        className="mr-2 bg-slate-700 font-bold text-emerald-400 rounded-md p-1 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
        disabled={isLoading}
        value={selectedCurrency.code}
        onChange={(e) => selectCurrency(e.target.value)}
        // onValueChange={selectCurrency}
      >
        {Object.values(currencies).map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code}
          </option>
        ))}
      </select>
      {/* </label>{" "} */}

      {isLoading && (
        <div className="absolute right-2 top-2 w-3 h-3 rounded-full border-2 border-t-transparent border-primary animate-spin" />
      )}
    </div>
  );
}
