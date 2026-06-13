const { createClient } = require("redis");

const client = createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://redis:6379",
});

redisClient.on("error", (err) => {
  console.log("Redis Error:", err);
});

async function connectRedis() {
  await redisClient.connect();
  console.log("Redis Connected");
}

module.exports = {
  redisClient,
  connectRedis,
};