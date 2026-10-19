/**
 * Error with an HTTP status code.
 * Throw it anywhere; the errorHandler middleware turns it into a JSON response.
 */
export default class ApiError extends Error {
    /**
     * @param {number} statusCode - HTTP status to send (e.g. 400, 404, 502)
     * @param {string} message - message shown to the client
     * @param {Object} [errors] - optional field errors, e.g. { input: 'Too short' }
     */
    constructor(statusCode, message, errors) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.errors = errors;
    }
}
