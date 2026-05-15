const axios = require('axios');
const config = require('../config/env');

const client = axios.create({
  baseURL: config.faceApiUrl,
  timeout: 30000,
});

const withRetry = async (fn, retries = 3) => {
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
      }
    }
  }
  throw lastError;
};

const enrollFace = (usn, image) =>
  withRetry(() => client.post('/enroll', { usn, image }));

const recognizeFace = (image) =>
  withRetry(() => client.post('/recognize', { image }));

const healthCheck = () => withRetry(() => client.get('/health'));

module.exports = { enrollFace, recognizeFace, healthCheck };
