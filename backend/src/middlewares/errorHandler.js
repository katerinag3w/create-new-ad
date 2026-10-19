/**
 * Central error handler: every error ends up here and is sent as JSON.
 * Must have 4 arguments so Express recognizes it as an error handler.
 */
export default function errorHandler(err, req, res, next) {
    const status = err.statusCode || 500;

    if (status >= 500) console.error(err); // log real server problems

    res.status(status).json({
        message: status === 500 ? 'Something went wrong' : err.message,
        ...(err.errors && { errors: err.errors }),
    });
}
