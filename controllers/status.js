const appStatus = async (req, res, next) => {
    try {
        const authResponse = await fetch(`${process.env.HEALTHCHECK}/auth`, { method: 'GET' });
        const transactionResponse = await fetch(`${process.env.HEALTHCHECK}/transaction`, { method: 'GET' });
        const userResponse = await fetch(`${process.env.HEALTHCHECK}/user`, { method: 'GET' });

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
};

const apiStatus = (req, res) => {
    res.sendStatus(200);
};

module.exports = { appStatus, apiStatus };
