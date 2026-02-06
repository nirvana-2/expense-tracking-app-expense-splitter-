const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes')
const groupRoutes = require('./routes/groupRoutes')
const expenseRoutes = require('./routes/expenseRoutes')
const userRoutes = require('./routes/userRoutes');


const app = express();

//cors congifuration
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'PUT', 'POST', 'DELETE'],
    credentials: true
}))
//body parser middelware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//API ROUTES
//authentication route
app.use("/api/auth", authRoutes);
//group route
app.use("/api/groups", groupRoutes)
//expense route
app.use("/api/expenses", expenseRoutes);
//user route
app.use("/api/users", userRoutes);

//test route
app.get('/test', (req, res) => {
    res.json({ message: "Backend API is working and CORS is configured" });
});
app.use((err, req, res, next) => {
    console.error('Error middleware caught:', err);
    res.status(500).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
});

module.exports = app;