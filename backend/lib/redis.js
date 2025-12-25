import { Redis } from "@upstash/redis";
import dotenv from "dotenv"

dotenv.config()

if (!process.env.UPSTASH_REDIS_REST_URL) {
  throw new Error("❌ UPSTASH_REDIS_REST_URL is missing");
}

if (!process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error("❌ UPSTASH_REDIS_REST_TOKEN is missing");
}

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;




// Disconnect after usage
//await client.disconnect();