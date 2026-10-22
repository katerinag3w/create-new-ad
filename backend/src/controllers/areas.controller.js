import ApiError from '../utils/ApiError.js';
import { getAreas } from '../services/autocomplete.service.js';
import { MIN_AREA_INPUT_LENGTH } from '../config/constants.js';

/** GET /api/areas?input=... – area suggestions, cached per input. */
export async function searchAreas(req, res) {
    const input = String(req.query.input ?? '').trim();

    if (input.length < MIN_AREA_INPUT_LENGTH) {
        throw new ApiError(400, `Input must be at least ${MIN_AREA_INPUT_LENGTH} characters`);
    }

    const { areas, fromCache } = await getAreas(input);
    res.set('X-Cache', fromCache ? 'HIT' : 'MISS');
    res.json(areas);
}
