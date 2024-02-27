import { Redis as OriginalRedis } from "ioredis";
import Redis from "ioredis-mock";

let redis: OriginalRedis;

export function getRedisInstance() {
  if (!redis) {
    redis = new Redis({
      enableAutoPipelining: true,
    });
  }
  return redis;
}
