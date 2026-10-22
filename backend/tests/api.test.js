import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../src/app.js';
import Ad from '../src/models/Ad.js';
import { areasCache, knownAreas } from '../src/services/autocomplete.service.js';

const API_ITEMS = [{ placeId: 'p1', mainText: 'Nafplio', secondaryText: 'Ελλάδα' }];

const VALID_AD = {
    title: 'Nice house',
    adType: 'rent',
    propertyType: 'house',
    area: { id: 'p1', name: 'Nafplio' },
    price: 1500,
};

let mongo;
let fetchMock;

beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
}, 120_000);

afterAll(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

beforeEach(async () => {
    process.env.AUTOCOMPLETE_API_URL = 'https://autocomplete.test/';
    fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => API_ITEMS });
    vi.stubGlobal('fetch', fetchMock);
    areasCache.clear();
    knownAreas.clear();
    await Ad.deleteMany({});
});

afterEach(() => vi.unstubAllGlobals());

describe('general', () => {
    it('GET /api/health', async () => {
        const res = await request(app).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ status: 'ok' });
    });

    it('unknown routes return 404 JSON', async () => {
        const res = await request(app).get('/api/nope');
        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/Route not found/);
    });

    it('invalid JSON body returns 400', async () => {
        const res = await request(app)
            .post('/api/ads')
            .set('Content-Type', 'application/json')
            .send('{bad json');
        expect(res.status).toBe(400);
    });
});

describe('GET /api/areas', () => {
    it('returns 400 for less than 3 characters', async () => {
        const res = await request(app).get('/api/areas?input=na');
        expect(res.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it('returns areas and serves repeated searches from the cache', async () => {
        const first = await request(app).get('/api/areas?input=naf');
        expect(first.status).toBe(200);
        expect(first.headers['x-cache']).toBe('MISS');
        expect(first.body).toEqual([{ id: 'p1', name: 'Nafplio', secondaryText: 'Ελλάδα' }]);

        const second = await request(app).get('/api/areas?input=NAF');
        expect(second.headers['x-cache']).toBe('HIT');
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it('returns 502 when the external API fails', async () => {
        fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
        const res = await request(app).get('/api/areas?input=naf');
        expect(res.status).toBe(502);
        expect(res.body.message).toBe('Autocomplete service failed (500)');
    });

    it('returns 504 with a readable message on timeout', async () => {
        fetchMock.mockRejectedValue(Object.assign(new Error('timeout'), { name: 'TimeoutError' }));
        const res = await request(app).get('/api/areas?input=naf');
        expect(res.status).toBe(504);
        expect(res.body.message).toBe('Autocomplete service timed out');
    });
});

describe('POST /api/ads', () => {
    it('creates an ad and stores the placeId', async () => {
        const res = await request(app).post('/api/ads').send({ ...VALID_AD, size: 90, bedrooms: 2 });

        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ title: 'Nice house', area: { id: 'p1', name: 'Nafplio' }, price: 1500 });
        const saved = await Ad.findById(res.body._id);
        expect(saved.area.id).toBe('p1');
    });

    it('returns 400 with field errors for missing fields', async () => {
        const res = await request(app).post('/api/ads').send({});
        expect(res.status).toBe(400);
        expect(Object.keys(res.body.errors).sort()).toEqual(['adType', 'area', 'price', 'propertyType', 'title']);
    });

    it('rejects invalid enum values, price and negative numbers', async () => {
        const res = await request(app).post('/api/ads').send({
            ...VALID_AD, adType: 'sell', propertyType: 'castle', price: 0, size: -1,
        });
        expect(res.status).toBe(400);
        expect(Object.keys(res.body.errors).sort()).toEqual(['adType', 'price', 'propertyType', 'size']);
    });

    it('rejects a placeId that the autocomplete API does not know', async () => {
        const res = await request(app).post('/api/ads').send({ ...VALID_AD, area: { id: 'fake', name: 'Nafplio' } });
        expect(res.status).toBe(400);
        expect(res.body.errors).toEqual({ area: 'Please select an area from the list' });
        expect(await Ad.countDocuments()).toBe(0);
    });
});

describe('GET /api/ads', () => {
    it('lists ads, newest first', async () => {
        await Ad.create({ ...VALID_AD, title: 'Old' });
        await Ad.create({ ...VALID_AD, title: 'New' });
        const res = await request(app).get('/api/ads');
        expect(res.status).toBe(200);
        expect(res.body.map((ad) => ad.title)).toEqual(['New', 'Old']);
    });

    it('returns one ad by id', async () => {
        const ad = await Ad.create(VALID_AD);
        const res = await request(app).get(`/api/ads/${ad._id}`);
        expect(res.status).toBe(200);
        expect(res.body.title).toBe('Nice house');
    });

    it('returns 400 for an invalid id and 404 for a missing ad', async () => {
        expect((await request(app).get('/api/ads/not-an-id')).status).toBe(400);
        expect((await request(app).get(`/api/ads/${new mongoose.Types.ObjectId()}`)).status).toBe(404);
    });
});
