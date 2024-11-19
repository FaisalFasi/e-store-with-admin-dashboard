// src/hooks/useFetchProducts.js
import { useEffect } from "react";
import { useProductStore } from "../../stores/useProductStore";
import { useSWRCustom } from "../useSWRCustom/useSWRCustom";

export const useFetchProducts = () => {
  const { setProducts, setLoading, setError } = useProductStore();
  const { data, error, isLoading } = useSWRCustom("/products");

  useEffect(() => {
    setLoading(isLoading);

    if (data) {
      setProducts(data?.products || []);
    }

    if (error) {
      setError(error?.message || "Failed to fetch products");
    }
  }, [data, error, isLoading, setProducts, setLoading, setError]);
};
