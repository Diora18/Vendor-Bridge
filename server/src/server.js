const app = require('./app');
const connectDb = require('./config/db');
const env = require('./config/env');

const startServer = async () => {
  await connectDb();
  app.listen(env.port, () => {
    console.log(`VendorBridge API running on port ${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
