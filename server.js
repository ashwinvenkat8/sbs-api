const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https');
const http = require('http');
const helmet = require('helmet');
const authRouter = require('./routes/accounts');
const dbconnect = require('./mongo/dbconnect');
require('dotenv').config({ path: `./.env` });

dbconnect();

const app = express();

app.use(cors({
    origin: "*",
    credentials: false
}));
app.use(helmet())
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

app.use('/api/auth', authRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

const options = {
    key: fs.readFileSync(process.env.CERT_PKEY),
    cert: fs.readFileSync(process.env.CERT_FILE)
};

https.createServer(options, app).listen(process.env.APP_PORT, () => {
    console.log(`Server is up and running on port: ${process.env.APP_PORT}!`);
});

http.createServer((req, res) => {
    res.writeHead(301, {
        'Location': 'https://' + req.headers.host + req.url
    });
    res.end();
}).listen(80, () => {
    console.log(`Server is redirecting insecure traffic.`);
});