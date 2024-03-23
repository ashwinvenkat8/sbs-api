const __getStatus = async (apiName) => {
    return await fetch(`${process.env.BASE_URL}/status/${apiName}`, { method: 'GET' });
};

const __isUP = (response) => {
    return response.status === 200 && response.body === 'OK';
};

const appStatus = async (req, res, next) => {
    try {
        const authResponse = __getStatus(`auth`);
        const transactionResponse = __getStatus(`transaction`);
        const userResponse = __getStatus(`user`);

        if (__isUP(authResponse) && __isUP(transactionResponse) && __isUP(userResponse)) {
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
