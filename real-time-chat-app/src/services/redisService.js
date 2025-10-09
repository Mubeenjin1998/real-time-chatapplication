const redisClient = require('../config/redis');

const initializeRedis = async () => {
  try {
    await redisClient.ping();
    console.log('Redis initialized successfully');
  } catch (error) {
    console.error('Redis initialization failed:', error);
  }
};

const setUserOnline = async (userId) => {
  try {
    await redisClient.set(`user:online:${userId}`, 'true', 'EX', 3600); // 1 hour
  } catch (error) {
    console.error('Error setting user online:', error);
  }
};

const setUserOffline = async (userId) => {
  try {
    await redisClient.del(`user:online:${userId}`);
  } catch (error) {
    console.error('Error setting user offline:', error);
  }
};

const isUserOnline = async (userId) => {
  try {
    const result = await redisClient.get(`user:online:${userId}`);
    return result === 'true';
  } catch (error) {
    console.error('Error checking user online status:', error);
    return false;
  }
};

module.exports = {
  initializeRedis,
  setUserOnline,
  setUserOffline,
  isUserOnline
};
