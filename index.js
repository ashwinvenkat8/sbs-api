const express = require('express');
const cors = require('cors');
const fs = require('fs');
const https = require('https')
const http = require('http')
require('dotenv').config()

var router = express()

router.use(cors())

router.use((req, res, next) => {
    if (!req.secure) {
        return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
});

const options = {
    key: fs.readFileSync('./private.key'),
    cert: fs.readFileSync('./server.crt')
};

router.get('/', async(req, res) => {
    res.send(
        "Working successfully"
    )
})

https.createServer(options, router).listen(443);

http.createServer((req, res) => {
    res.writeHead(301, { 'Location': 'https://' + req.headers.host + req.url });
    res.end();
}).listen(80);

