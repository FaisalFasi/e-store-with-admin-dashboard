// components/CurrencyTester.js
import { useFormattedPrice } from "@/hooks/formattedPrice/useFormattedPrice";
import { useState } from "react";
import { Currency, setUserCurrency } from "./currency";

export function CurrencyTester() {
  const { currency, formatFromUSDCents } = useFormattedPrice();
  const [testAmount, setTestAmount] = useState(1000); // Default test with 1000 cents ($10.00)

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 shadow-lg rounded-lg border border-gray-200 z-50">
      <h3 className="font-bold mb-2">Currency Tester</h3>

      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">
          Test Amount (cents):
        </label>
        <input
          type="number"
          value={testAmount}
          onChange={(e) => setTestAmount(Number(e.target.value))}
          className="w-full p-2 border rounded"
          min="0"
        />
      </div>

      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setUserCurrency(Currency.USD)}
          className={`px-3 py-1 rounded ${
            currency === Currency.USD ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          USD
        </button>
        <button
          onClick={() => setUserCurrency(Currency.EUR)}
          className={`px-3 py-1 rounded ${
            currency === Currency.EUR ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          EUR
        </button>
        <button
          onClick={() => setUserCurrency(Currency.PKR)}
          className={`px-3 py-1 rounded ${
            currency === Currency.PKR ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          PKR
        </button>
      </div>

      <div className="p-3 bg-gray-50 rounded">
        <p className="font-medium">Current Currency: {currency}</p>
        <p className="text-lg mt-1">{formatFromUSDCents(testAmount)}</p>
      </div>
    </div>
  );
}
