const jwt = require('jsonwebtoken');
const config = require('../config/env');

const generateToken = (userId, role) =>
  jwt.sign({ id: userId, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });

module.exports = generateToken;
