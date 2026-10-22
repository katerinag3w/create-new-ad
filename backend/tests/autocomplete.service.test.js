import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
    areasCache, fetchAreas, findArea, getAreas, knownAreas,
} from '../src/services/autocomplete.service.js';

const API_ITEMS = [
    { placeId: 'p1', mainText: 'Nafplio', secondaryText: 'Ελλάδα' },
    { placeId: 'p2', mainText: 'Nafpliou', secondaryText: 'Αθήνα, Ελλάδα' },
];

/** Makes fetch resolve with this JSON body. */
const respondWith = (body, { ok = true, status = 200 } = {}) =>
    vi.fn().mockResolvedValue({ ok, status, json: async () => body });

beforeEach(() => {
    process.env.AUTOCOMPLETE_API_URL = 'https://autocomplete.test/';
    areasCache.clear();
    knownAreas.clear();
});

afterEach(() => vi.unstubAllGlobals());

describe('fetchAreas', () => {
    it('calls the API with the encoded input and maps the response', async () => {
        const fetchMock = respondWith(API_ITEMS);
        vi.stubGlobal('fetch', fetchMock);

        const areas = await fetchAreas('Ναύπλιο & co');

        expect(fetchMock.mock.calls[0][0]).toBe(
            `https://autocomplete.test/?input=${encodeURIComponent('Ναύπλιο & co')}`,
        );
        expect(areas).toEqual([
            { id: 'p1', name: 'Nafplio', secondaryText: 'Ελλάδα' },
            { id: 'p2', name: 'Nafpliou', secondaryText: 'Αθήνα, Ελλάδα' },
        ]);
    });

    it('drops items without a placeId or mainText', async () => {
        vi.stubGlobal('fetch', respondWith([{ mainText: 'No id' }, { placeId: 'x' }, API_ITEMS[0]]));
        expect(await fetchAreas('naf')).toHaveLength(1);
    });

    it('throws 500 when the API URL is not configured', async () => {
        delete process.env.AUTOCOMPLETE_API_URL;
        await expect(fetchAreas('naf')).rejects.toMatchObject({ statusCode: 500 });
    });

    it('throws 504 on timeout', async () => {
        const timeout = Object.assign(new Error('timeout'), { name: 'TimeoutError' });
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(timeout));
        await expect(fetchAreas('naf')).rejects.toMatchObject({ statusCode: 504 });
    });

    it('throws 502 when the API cannot be reached', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('fetch failed')));
        await expect(fetchAreas('naf')).rejects.toMatchObject({ statusCode: 502 });
    });

    it('throws 502 when the API returns an error status', async () => {
        vi.stubGlobal('fetch', respondWith({}, { ok: false, status: 403 }));
        await expect(fetchAreas('naf')).rejects.toMatchObject({
            statusCode: 502,
            message: 'Autocomplete service failed (403)',
        });
    });

    it('throws 502 for invalid JSON', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
            ok: true, json: async () => { throw new SyntaxError('bad json'); },
        }));
        await expect(fetchAreas('naf')).rejects.toMatchObject({ statusCode: 502 });
    });

    it('throws 502 when the response is not an array', async () => {
        vi.stubGlobal('fetch', respondWith({ results: [] }));
        await expect(fetchAreas('naf')).rejects.toMatchObject({ statusCode: 502 });
    });
});

describe('getAreas', () => {
    it('calls the API once per input, ignoring case', async () => {
        const fetchMock = respondWith(API_ITEMS);
        vi.stubGlobal('fetch', fetchMock);

        expect((await getAreas('Nafp')).fromCache).toBe(false);
        expect((await getAreas('nafp')).fromCache).toBe(true);
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });
});

describe('findArea', () => {
    it('finds an area already sent to a client without calling the API again', async () => {
        const fetchMock = respondWith(API_ITEMS);
        vi.stubGlobal('fetch', fetchMock);
        await getAreas('naf');

        expect(await findArea('p2', 'anything')).toMatchObject({ id: 'p2', name: 'Nafpliou' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('searches the API by name when the id is not known yet', async () => {
        const fetchMock = respondWith(API_ITEMS);
        vi.stubGlobal('fetch', fetchMock);

        expect(await findArea('p1', 'Nafplio')).toMatchObject({ id: 'p1' });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('returns undefined for a made-up id', async () => {
        vi.stubGlobal('fetch', respondWith(API_ITEMS));
        expect(await findArea('fake', 'Nafplio')).toBeUndefined();
    });
});
