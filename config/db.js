const mongoose = require('mongoose');
const User =require("../models/User")

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    }
    console.log('Connected DB:', mongoose.connection.name);
    console.log('Searching in collection:', User.collection.collectionName);

};


module.exports = connectDB;