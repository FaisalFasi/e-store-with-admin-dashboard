// middleware/limiter.js
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
  message: "Too many requests, please try again after 15 minutes.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // headers: true,
});

export default limiter;

// import rateLimit from "express-rate-limit";

// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // Limit each IP to 100 requests per window
//   message: "Too many requests, please try again later.",
//   headers: true,
// });

// export default limiter;
