import ApiError from '../utils/ApiError.js';

/** Any request that didn't match a route → 404. */
export default function notFound(req, res, next) {
    next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}
