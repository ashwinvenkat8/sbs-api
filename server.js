const cors = require('cors');
const express = require('express');
const fs = require('node:fs');
const https = require('node:https');
const http = require('node:http');
const helmet = require('helmet');

const { notFoundHandler, serverErrorHandler } = require('./middleware/handler');
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
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.APP_ENV === 'prod') {
        return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
});

app.get('/', (req, res) => {
    res.status(200).json({
        "status": "UP"
    });
});

app.use(`${API_BASE}/auth`, authRoutes);
app.use(`${API_BASE}/user`, userRoutes);
app.use(`${API_BASE}/transaction`, transactionRoutes);

app.use(notFoundHandler);
app.use(serverErrorHandler);

const options = {
    key: fs.readFileSync(process.env.CERT_PKEY),
    cert: fs.readFileSync(process.env.CERT_FILE)
};

https.createServer(options, app).listen(process.env.APP_PORT, () => {
    console.log(`Server is up and running on port: ${process.env.APP_PORT}`);
});

http.createServer((req, res) => {
    res.writeHead(301, {
        'Location': 'https://' + req.headers.host + req.url
    });
    res.end();
}).listen(80, () => {
    console.log(`Server is redirecting insecure traffic.`);
});
