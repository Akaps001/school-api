
const Redis = require("ioredis");

const runTest = async (redis, prefix) => {
  try {
    const key = `${prefix}:test:${new Date().getTime()}`;
    await redis.set(key, "Redis Test Done.");
    let data = await redis.get(key);
    console.log(`Cache Test Data: ${data}`);
    redis.del(key);
  } catch (error) {
    // Silently fail if Redis is not available
  }
}

const createClient = ({ prefix, url }) => {

  console.log({ prefix, url })

  const redis = new Redis(url, {
    keyPrefix: prefix + ":",
    lazyConnect: true,  // Don't connect immediately
    retryStrategy: () => null,  // Don't retry on connection failure
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false  // Don't queue commands when offline
  });

  //register client events
  redis.on('error', (error) => {
    // Just log, don't crash - errors are expected when Redis is unavailable
  });

  // Try to connect, but don't fail if it doesn't work
  redis.connect().catch(() => {
    // Silently fail
  });

  return redis;
}



exports.createClient = createClient;
