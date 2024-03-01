const cors = require('cors');
const dbconnect = require("./mongo/dbconnect");
const express = require('express');
const fs = require('fs');
const https = require('https');
const http = require('http');

require('dotenv').config({ path: `./.env` });

dbconnect();

const app = express();

app.use(express.json());

app.use(cors({
    origin: "*",
    credentials: false
}));

app.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

app.get('/', (req, res) => {
    res.status(200).json({
        "status": "UP"
    });
});

// app.get('/transactions/:id', (req, res) => {
//     res.status(200).json({'transaction': {}});
// });

// app.get('/transactions', (req, res) => {
//     res.status(200).json({'transactions': {}});
// });

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
