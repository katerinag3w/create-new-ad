import ApiError from '../utils/ApiError.js';

const REQUEST_TIMEOUT_MS = 5000;

/**
 * Converts one item of the external API response into our own shape.
 */
function toArea(item) {
    return {
        id: item.placeId,
        name: item.mainText,
        secondaryText: item.secondaryText,
    };
}

/**
 * Calls the external autocomplete API.
 * @param {string} input - text typed by the user
 * @returns {Promise<Array<{id: string, name: string, secondaryText?: string}>>}
 * @throws {ApiError} 502 if the API fails, 504 on timeout
 */
export async function fetchAreas(input) {
    // Read env here (not at the top of the file): in ESM, imports run
    // before dotenv.config() in index.js, so process.env would be empty there.
    const baseUrl = process.env.AUTOCOMPLETE_API_URL;
    if (!baseUrl) throw new ApiError(500, 'Autocomplete API is not configured');

    const url = `${baseUrl}?input=${encodeURIComponent(input)}`;

    let res;
    try {
        res = await fetch(url, { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) });
    } catch (err) {
        if (err.name === 'TimeoutError') throw new ApiError(504, 'Autocomplete service timed out');
        throw new ApiError(502, 'Could not reach autocomplete service');
    }

    if (!res.ok) {
        throw new ApiError(502, `Autocomplete service failed (${res.status})`);
    }

    let data;
    try {
        data = await res.json();
    } catch {
        throw new ApiError(502, 'Autocomplete service returned invalid data');
    }

    if (!Array.isArray(data)) {
        throw new ApiError(502, 'Autocomplete service returned an unexpected format');
    }

    return data.map(toArea).filter((area) => area.id && area.name);
}
