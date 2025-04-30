import axios from "axios";

const axiosBaseURL = axios.create({
  baseURL:
    import.meta.env.VITE_MODE === "development"
      ? import.meta.env.VITE_API_BASE_URL
      : `${window.location.origin}/api`, // Use the current domain and append the '/api' endpoint for production

  withCredentials: true, // send cookies when cross-domain requests
  timeout: 15000, // 10 seconds timeout
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token from localStorage if available
axiosBaseURL.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const userData = JSON.parse(user);
        if (userData?.token) {
          config.headers.Authorization = `Bearer ${userData.token}`;
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosBaseURL;
