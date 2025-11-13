const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');

// Import Routes
const leadRoutes = require('./routes/leads');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const analyticsRoutes = require("./routes/analytics"); // ✅
const reportRoutes = require("./routes/report");
const dashboardRoutes = require("./routes/dashboard");

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/customers', customerRoutes);
app.use("/api/analytics", analyticsRoutes); // 
app.use("/api/report", reportRoutes);
app.use("/api/dashboard", dashboardRoutes);





const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
