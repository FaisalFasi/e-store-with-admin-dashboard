import Redis from "ioredis";
import dotenv from "dotenv";
dotenv.config();

// redis is a new instance of the Redis class use the URL from the .env file to connect to the Redis server
const redis = new Redis(process.env.UPSTASH_REDIS_URL);
// await redis.set("foo", "bar");

// on the connect event, log a message to the console
redis.on("connect", () => console.log("Connected to Redis successfully."));
redis.on("error", (err) => console.error("Redis connection error:", err));

export default redis;
