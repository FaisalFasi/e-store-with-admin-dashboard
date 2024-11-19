import useSWR from "swr";
import fetcher from "../../lib/fetcher";

// data is the body of the request
export const useSWRCustom = (endpoint, method = "GET", data = null) => {
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
