// middleware/limiter.js
import { rateLimit } from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes).
  message: "Too many requests, please try again after 5 minutes.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // headers: true,
});

export default limiter;

// // middleware / limiter.js; custom
// import redis from "../db/redis.js";

// const getClientIp = (req) => {
//   // If the request is behind a reverse proxy, it will have the X-Forwarded-For header
//   const forwardedIps = req.headers["x-forwarded-for"];

//   // If the header exists, it may contain a comma-separated list of IPs.
//   // The first one is usually the real client IP.
//   if (forwardedIps) {
//     return forwardedIps.split(",")[0];
//   }

//   // Fallback to req.ip if no X-Forwarded-For header exists
//   return req.ip;
// };
// export const logIpMiddleware = (req, res, next) => {
//   const clientIp = getClientIp(req);
//   console.log("Client IP:", clientIp); // You can log or save this for security purposes
//   next();
// };

// const limiter = async (req, res, next) => {
//   const MAX_REQUESTS = req.user?.isAdmin ? 10 : 3;
//   const WINDOW_SIZE_IN_SECONDS = 60; // Time window in seconds

//   try {
//     const userId = req.user?.id || req.ip;
//     const redisKey = `rate_limit:${userId}`;
//     const requestCount = await redis.incr(redisKey);
//     // Set expiry of the key if it is accessed for the first time in the time window
//     if (requestCount === 1) {
//       redis.expire(redisKey, WINDOW_SIZE_IN_SECONDS);
//     }
//     // If the request count exceeds the limit, return 429 status code
//     if (requestCount > MAX_REQUESTS) {
//       const ttl = await redis.ttl(redisKey);

//       return res.status(429).json({
//         message: `Rate limit exceeded. Try again in ${ttl} seconds.`,
//       });
//     }
//     next();
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// export default limiter;
