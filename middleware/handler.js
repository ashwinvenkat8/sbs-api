function notFoundHandler(req, res, next) {
    res.status(404).json({"error": "Not found"});
    next();
}

function serverErrorHandler(err, req, res, next) {
    console.error(err.stack);
    res.status(500).json({"error": "Internal Server Error"});
    next(err);
}

module.exports = { notFoundHandler, serverErrorHandler };
