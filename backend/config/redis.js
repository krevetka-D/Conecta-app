// backend/config/redis.js
const redis = require('redis');
const { promisify } = require('util');

const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD,
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

const getAsync = promisify(redisClient.get).bind(redisClient);
const setAsync = promisify(redisClient.set).bind(redisClient);
const delAsync = promisify(redisClient.del).bind(redisClient);
const existsAsync = promisify(redisClient.exists).bind(redisClient);

module.exports = {
    redisClient,
    getAsync,
    setAsync,
    delAsync,
    existsAsync,
};