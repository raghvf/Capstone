const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');

connectDB();

app.listen(config.port, () => {
  console.log(`Smart Campus API running on http://localhost:${config.port}`);
});
