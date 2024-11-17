import axios from "axios";

const axiosBaseURL = axios.create({
  baseURL:
    import.meta.env.VITE_MODE === "development"
      ? import.meta.env.VITE_API_BASE_URL
      : `${window.location.origin}/api`, // Use the current domain and append the '/api' endpoint for production

  withCredentials: true, // send cookies when cross-domain requests
});

export default axiosBaseURL;
