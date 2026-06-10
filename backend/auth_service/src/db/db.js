const mongoose = require('mongoose');
const _config = require("../config/config");


const connectDB = async () => {
  try {
    await mongoose.connect(_config.MONGO_URI)
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;