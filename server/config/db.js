const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pg_finder_db', {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`====================================================`);
    console.log(`✅ [Database] MongoDB Connected: ${conn.connection.host}`);
    console.log(`====================================================`);
  } catch (error) {
    console.error(`====================================================`);
    console.error(`❌ [Database Error] Could not connect to MongoDB Atlas.`);
    console.error(`📍 Reason: Your IP address is not on your MongoDB Atlas IP Whitelist.`);
    console.error(`💡 Solution: Go to cloud.mongodb.com -> Network Access -> Add IP (0.0.0.0/0).`);
    console.error(`====================================================`);
  }
};

module.exports = connectDB;
