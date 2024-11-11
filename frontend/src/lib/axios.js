import axios from "axios";

const axiosBaseURL = axios.create({
  baseURL:
    import.meta.env.VITE_MODE === "development"
      ? import.meta.env.VITE_API_BASE_URL
      : "/api",
  withCredentials: true, // send cookies when cross-domain requests
  // on deployment how it will get the domain?
  //like import.meta.url? or import.meta.env?
  // so that we can use it in the baseURL below to get the domain name and append the api path to it
  // baseURL:
  //   import.meta.mode === "development" ? "http://localhost:5000" : "/api",
});

export default axiosBaseURL;
