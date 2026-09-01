const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '127.0.0.1';
const MONGODB_URL =
  process.env.MONGODB_URL ||
  'mongodb+srv://api-63:3tiD06JMmmuo933J@database.6xslxk7.mongodb.net/?appName=database' ||
  'mongodb://127.0.0.1:27017/localshop';
const DB_NAME = process.env.DB_NAME || 'api-63';

// Middlewares
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'Local Shop Management Server is running',
    version: '1.0.0'
  });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'online',
    message: 'Local Shop Management API is ready',
    endpoints: {
      signup: 'POST /api/auth/signup',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me'
    }
  });
});

// Mount user / auth routes
app.use('/api/auth', userRoutes);
app.use('/api/v1/auth', userRoutes);
app.use('/api/user', userRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.status || err.code || 500;
  res.status(status < 600 && status >= 400 ? status : 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// MongoDB Connection & Server Start
mongoose
  .connect(MONGODB_URL, {
    dbName: DB_NAME,
    autoIndex: true
  })
  .then(() => {
    console.log('***** MongoDB Connected Successfully *****');
    app.listen(PORT, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`Auth endpoints mounted at http://${HOST}:${PORT}/api/auth`);
    });
  })
  .catch((err) => {
    console.error('***** Error connecting to MongoDB *****', err.message);
    app.listen(PORT, HOST, () => {
      console.log(`Server running in fallback mode on http://${HOST}:${PORT}`);
    });
  });

module.exports = app;
