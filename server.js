const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const statusRoutes = require('./routes/status');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const transactionRoutes = require('./routes/transaction');
const connectDb = require('./mongo/connectDb');

require('dotenv').config({ path: `./.env` });

connectDb();

const API_BASE = '/api/v1';
const app = express();

// TODO: Review these settings for security
app.set('case sensitive routing', true);
app.set('x-powered-by', false);

app.use(cors({
    origin: "*",
    credentials: false
}));

// Express.js also provides a method to reduce fingerprinting: app.disable('x-powered-by');
// (https://stackoverflow.com/questions/5867199/cant-get-rid-of-header-x-powered-byexpress/12484642#12484642)
// We are using Helmet.js (https://helmetjs.github.io/)
app.use(helmet());
app.use(express.json());

// App routes
app.use(`${API_BASE}/status`, statusRoutes);
app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/user`, userRoutes);
app.use(`${API_BASE}/transaction`, transactionRoutes);

app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
    next();
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
    next(err);
});

app.listen(process.env.APP_PORT, () => {
    console.log(`Server is up and running on port: ${process.env.APP_PORT}`);
});
