const mongoose = require('mongoose');

async function connect(url) {
  const uri = url || process.env.MONGODB_URL || 'mongodb+srv://api-63:3tiD06JMmmuo933J@database.6xslxk7.mongodb.net/?appName=database' || 'mongodb://127.0.0.1:27017/localshop';
  const res = await mongoose.connect(uri, {
    dbName: process.env.DB_NAME || 'api-63',
    autoIndex: true
  });
  if (res.connections && res.connections.length > 0) {
    console.log('Connected to MongoDB successfully!');
  }
  return res;
}

module.exports = connect;
