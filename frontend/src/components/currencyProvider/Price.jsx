import React from "react";
import { usePrice } from "@/utils/currency/currency";
// import { cn } from "@/lib/utils";

export function Price({ priceInCents, className, size = "md" }) {
  const { formatPrice, isLoading } = usePrice();

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl font-semibold",
  };

  if (isLoading) {
    return (
      <div
        className={"h-5 w-16 bg-gray-200 animate-pulse rounded"}
        // className={cn(
        //   "h-5 w-16 bg-gray-200 animate-pulse rounded",
        //   sizeClasses[size],
        //   className
        // )}
      />
    );
  }

  return (
    <span
    // className={cn(sizeClasses[size], className)}
    >
      {formatPrice(priceInCents)}
    </span>
  );
}
