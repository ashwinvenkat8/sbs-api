const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const helmet = require('helmet');
const authRouter = require('./routes/accounts');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json()); // Replaces bodyParser.json()

// Redirect HTTP to HTTPS
app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
        return res.redirect(`https://${req.hostname}${req.url}`);
    }
    next();
});

app.get('/', async (req, res) => {
    res.send("Working successfully");
});

// Mount authRouter at /api/auth path
app.use('/api/auth', authRouter);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

const options = {
    key: fs.readFileSync('./private.key'),
    cert: fs.readFileSync('./server.crt')
};

https.createServer(options, app).listen(443);
http.createServer((req, res) => {
    res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
    res.end();
}).listen(80);