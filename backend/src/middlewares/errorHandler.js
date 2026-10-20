/**
 * Central error handler: every error ends up here and is sent as JSON.
 * Must have 4 arguments so Express recognizes it as an error handler.
 */
// eslint-disable-next-line no-unused-vars
export default function errorHandler(err, req, res, next) {
    let status = err.statusCode || 500;
    let errors = err.errors;
    // Mongoose schema validation → 400 with field errors
    if (err.name === 'ValidationError') {
        status = 400;
        errors = Object.fromEntries(
            Object.entries(err.errors).map(([field, e]) => [field, e.message]),
        );
    }
    // Invalid ObjectId etc.
    if (err.name === 'CastError') status = 400;
    // Invalid JSON body
    if (err.type === 'entity.parse.failed') status = 400;
    if (status >= 500) console.error(err);
    res.status(status).json({
        message: status >= 500 ? 'Something went wrong' : err.message,
        ...(errors && { errors }),
    });
}
