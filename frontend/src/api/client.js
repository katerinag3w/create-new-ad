const BASE_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Error thrown for any failed API call.
 * @property {number} status - HTTP status (0 = network error)
 * @property {Object} [errors] - field errors from the backend, e.g. { title: 'Required' }
 */

export class ApiError extends Error {
    constructor(message, status, errors) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

/**
 * Small wrapper around fetch: adds the base URL, sends/receives JSON,
 * and throws ApiError when the response is not OK.
 */
export async function request(path, { method = 'GET', body, signal } = {}) {
    let res;
    try {
        res = await fetch(`${BASE_URL}${path}`, {
            method,
            headers: body ? { 'Content-Type': 'application/json' } : undefined,
            body: body ? JSON.stringify(body) : undefined,
            signal,
        });
    } catch (err) {
        if (err.name === 'AbortError') throw err; // request was cancelled on purpose
        throw new ApiError('Network error. Is the server running?', 0);
    }
    const data = await res.json().catch(() => null); // body may be empty or not JSON

    if (!res.ok) {
        throw new ApiError(data?.message || `Request failed (${res.status})`, res.status, data?.errors);
    }
    return data;
}