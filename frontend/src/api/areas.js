import { request } from './client';

/**
 * Search areas for the autocomplete.
 * @param {string} input - text typed by the user (min 3 chars)
 * @param {AbortSignal} [signal] - lets the caller cancel an outdated request
 * @returns {Promise<Array<{id: string, name: string, secondaryText?: string}>>}
 */

export const searchAreas = (input, signal) =>
    request(`/areas?input=${encodeURIComponent(input)}`, { signal });

//encodeURIComponent makes Greek letters, spaces and & safe to put in a URL.