const express = require('express');

const router = express.Router();

// App status
router.get('/', async (req, res, next) => {
    try {
        const authResponse = await fetch(`${process.env.BASE_URL}/status/auth`, { method: 'GET' });
        const transactionResponse = await fetch(`${process.env.BASE_URL}/status/transaction`, { method: 'GET' });
        const userResponse = await fetch(`${process.env.BASE_URL}/status/user`, { method: 'GET' });

        if (
            authResponse.status === 200 &&
            transactionResponse.status === 200 &&
            userResponse.status === 200
        ) {
            res.status(200).json({
                status: 'UP',
                message: 'All services are up and running.'
            });
        } else {
            res.status(500).json({
                status: 'UNSTABLE',
                message: 'One or more services are down.',
                services: {
                    auth: authResponse.status,
                    transaction: transactionResponse.status,
                    user: userResponse.status,
                }
            });
        }
    } catch(err) {
        res.status(500).json({
            status: 'ERROR',
            message: 'An error occurred while checking the overall system status. Please try again later.'
        });
        next(err);
    }
});

// Auth status
router.get('/auth', (req, res) => {
    res.sendStatus(200);
});

// Transaction status
router.get('/transaction', (req, res) => {
    res.sendStatus(200);
});

// User status
router.get('/user', (req, res) => {
    res.sendStatus(200);
});

module.exports = router;
