import useSWR from "swr";
import fetcher from "./fetcher";

export const useSWR_ = (endpoint, method = "GET", data = null) => {
  const { data: responseData, error } = useSWR(
    [endpoint, method, data], // Passing all parameters so SWR can react to changes
    (url, method, data) => fetcher(url, method, data)
  );

  return {
    data: responseData,
    error,
    isLoading: !responseData && !error,
  };
};
