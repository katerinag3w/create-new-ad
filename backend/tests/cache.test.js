import { afterEach, describe, expect, it, vi } from 'vitest';
import Cache from '../src/services/cache.service.js';

describe('Cache', () => {
    afterEach(() => vi.useRealTimers());

    it('returns a stored value and undefined for a missing key', () => {
        const cache = new Cache(60);
        cache.set('a', [1]);
        expect(cache.get('a')).toEqual([1]);
        expect(cache.get('b')).toBeUndefined();
    });

    it('expires entries after the TTL', () => {
        vi.useFakeTimers();
        const cache = new Cache(10);
        cache.set('a', 1);
        vi.advanceTimersByTime(9_000);
        expect(cache.get('a')).toBe(1);
        vi.advanceTimersByTime(2_000);
        expect(cache.get('a')).toBeUndefined();
    });

    it('removes the oldest entry when full', () => {
        const cache = new Cache(60, 2);
        cache.set('a', 1);
        cache.set('b', 2);
        cache.set('c', 3);
        expect(cache.get('a')).toBeUndefined();
        expect(cache.get('b')).toBe(2);
        expect(cache.get('c')).toBe(3);
    });

    it('clear() removes everything', () => {
        const cache = new Cache(60);
        cache.set('a', 1);
        cache.clear();
        expect(cache.get('a')).toBeUndefined();
    });
});
