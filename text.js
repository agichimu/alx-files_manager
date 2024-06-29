// Inside the folder utils, create a file redis.js

class RedisClient {
    constructor() {
      // Create a client to Redis
      this.client = createRedisClient();
  
      // Display any error of the redis client in the console
      this.client.on('error', (error) => {
        console.error(error);
      });
    }
  
    isAlive() {
      // Returns true when the connection to Redis is successful, otherwise false
      return this.client.connected;
    }
  
    async get(key) {
      // Takes a string key as argument and returns the Redis value stored for this key
      return await this.client.get(key);
    }
  
    async set(key, value, duration) {
      // Takes a string key, a value, and a duration in seconds as arguments to store it in Redis
      // Set an expiration for the key based on the duration argument
      await this.client.set(key, value, 'EX', duration);
    }
  
    async del(key) {
      // Takes a string key as argument and removes the value in Redis for this key
      await this.client.del(key);
    }
  }
  
  // Create and export an instance of RedisClient called redisClient
  const redisClient = new RedisClient();
  export default redisClient;
  