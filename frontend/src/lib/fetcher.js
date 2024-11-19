// src/hooks/fetcher.js
import axiosBaseURL from "./axios";

const fetcher = (url, method = "GET", data = null) => {
  // Handle the dynamic method based on the HTTP verb (GET, POST, PUT, DELETE)
  const config = {
    method,
    url,
    data, // For POST, PUT, DELETE, pass the data in the body
  };

  return axiosBaseURL(config)
    .then((res) => res.data)
    .catch((error) => {
      throw error.response ? error.response.data : error;
    });
};

export default fetcher;
