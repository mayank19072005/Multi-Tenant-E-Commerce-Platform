const Redis = require('ioredis');

// Built-in Redis Emulator for seamless development
class RedisEmulator {
  constructor() {
    this.store = new Map();
    console.log('✅ Internal Redis Emulator Ready');
  }
  async get(key) { return this.store.get(key) || null; }
  async set(key, value, mode, duration) {
    this.store.set(key, value.toString());
    if (mode === 'EX' && duration) {
      setTimeout(() => this.store.delete(key), duration * 1000);
    }
    return 'OK';
  }
  async del(key) { return this.store.delete(key) ? 1 : 0; }
  async exists(key) { return this.store.has(key) ? 1 : 0; }
  on() {} 
}

let redis;
if (process.env.REDIS_URL && process.env.REDIS_URL !== 'redis://localhost:6379') {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: () => null
  });
  redis.on('error', () => {
    if (!(redis instanceof RedisEmulator)) {
      redis = new RedisEmulator();
    }
  });
} else {
  redis = new RedisEmulator();
}

module.exports = redis;