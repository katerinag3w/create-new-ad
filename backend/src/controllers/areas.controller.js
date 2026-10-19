import ApiError from '../utils/ApiError.js';
import Cache from '../services/cache.service.js';
import { fetchAreas } from '../services/autocomplete.service.js';
import { MIN_AREA_INPUT_LENGTH } from '../config/constants.js';

export const areasCache = new Cache(Number(process.env.AREAS_CACHE_TTL_SECONDS) || 600);


export async function searchAreas(req, res) {
    const input = String(req.query.input ?? '').trim();

    if (input.length < MIN_AREA_INPUT_LENGTH) {
        throw new ApiError(400, `Input must be at least ${MIN_AREA_INPUT_LENGTH} characters`);
    }

    const key = input.toLowerCase();
    const cached = areasCache.get(key);
    if (cached) {
        res.set('X-Cache', 'HIT');
        return res.json(cached);
    }

    const areas = await fetchAreas(input);
    areasCache.set(key, areas);
    res.set('X-Cache', 'MISS');
    res.json(areas);
}
