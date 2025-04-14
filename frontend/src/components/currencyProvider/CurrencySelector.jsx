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
      <label>
        Currency:
        <select
          name="selected currency"
          id="selected currency"
          className="ml-2 bg-slate-500 text-white rounded-md px-2 py-1"
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
      </label>{" "}
      {/* <Select
        disabled={isLoading}
        value={selectedCurrency.code}
        onValueChange={selectCurrency}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Currency" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Currencies</SelectLabel>
            {Object.values(currencies).map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.symbol} {currency.code}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select> */}
      {isLoading && (
        <div className="absolute right-2 top-2 w-3 h-3 rounded-full border-2 border-t-transparent border-primary animate-spin" />
      )}
    </div>
  );
}
