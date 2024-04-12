const cors = require('cors');
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const morgan = require('morgan');
const path = require('path');
const { slowDown } = require('express-slow-down');

const connectDb = require('./mongo/connectDb');
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/review');
const statusRoutes = require('./routes/status');
const transactionRoutes = require('./routes/transaction');
const userRoutes = require('./routes/user');

// Setup app environment
require('dotenv').config({ path: `./.env` });

// Establish database connection
connectDb();

// Initialize app
const app = express();

// App settings
app.set('trust proxy', 1); // trust first proxy
app.set('case sensitive routing', true); // ensures strict routing
app.set('x-powered-by', false); // reduce what can be fingerprinted about the server/app

// Rate limiter middleware
if(process.env.NODE_ENV === 'production') {
    app.use(slowDown({
        windowMs: 15 * 60000, // 15 minutes
        delayAfter: 100, // allow 20 requests per window without delay
        delayMs: (hits) => hits * 100, // delay subsequent requests by 100ms each
    }));
}

// Cross-origin resource sharing middleware
app.use(cors({
    origin: "*",
    credentials: false
}));

// MongoDB input sanitizing middleware
app.use(mongoSanitize()); // helps sanitize user input to prevent NoSQL injection

// Security middleware
app.use(helmet()); // sets security-related HTTP headers
app.use(express.json()); // helps parse JSON in the request body

// Request logging
const accessLogStream = fs.createWriteStream(path.join(`${__dirname}/logs/`, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));

// API routes
app.use(`${process.env.API_BASE}/auth`, authRoutes);
app.use(`${process.env.API_BASE}/review`, reviewRoutes);
app.use(`${process.env.API_BASE}/status`, statusRoutes);
app.use(`${process.env.API_BASE}/transaction`, transactionRoutes);
app.use(`${process.env.API_BASE}/user`, userRoutes);

// Error handlers
app.use((req, res, next) => {
    console.log(`\n${req.ip} ${req.method} ${req.url} 404 Not Found`);
    res.status(404).json({ message: "Route not found" });
    next();
});
app.use((err, req, res, next) => {
    console.group(`\n${req.ip} ${req.method} ${req.url} 500 Internal Server Error`);

    if(process.env.NODE_ENV === 'production') {
        console.log(`\n${err.name}: ${err.message}`);
    } else {
        console.debug(`\nRequest:\n\tLength: ${req.length}\n\tHeaders: ${req.headers}\n\tPayload: ${req.body}`);
        console.debug(`\nStack trace: ${err.stack}`);
    }

    console.groupEnd();

    res.status(500).json({ error: "Internal Server Error" });
});

// Start app
app.listen(process.env.APP_PORT, () => {
    console.log(`App is up and running on port: ${process.env.APP_PORT}`);
});
