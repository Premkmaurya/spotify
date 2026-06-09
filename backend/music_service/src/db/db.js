const mongoose = require('mongoose');
const _config = require('../../config/config');


const connectDB = async () => {
    try {
        await mongoose.connect(_config.MONGODB_URI)
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
};

module.exports = connectDB;