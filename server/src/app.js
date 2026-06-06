const express = require('express');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');
const routes = require('./routes');
const env = require('./config/env');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: env.clientUrl, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'vendorbridge-api' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', routes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;

