/**
 * Very small in-memory cache with time-to-live (TTL).
 * Good enough for one server instance; data is lost on restart.
 */
export default class Cache {
    /**
     * @param {number} ttlSeconds - how long an entry stays valid
     * @param {number} [maxEntries=500] - oldest entries are removed above this
     */
    constructor(ttlSeconds, maxEntries = 500) {
        this.ttlMs = ttlSeconds * 1000;
        this.maxEntries = maxEntries;
        this.store = new Map();
    }

    /** Returns the cached value, or undefined if missing/expired. */
    get(key) {
        const entry = this.store.get(key);
        if (!entry) return undefined;
        if (Date.now() > entry.expiresAt) {
            this.store.delete(key);
            return undefined;
        }
        return entry.value;
    }

    /** Stores a value; removes the oldest entry if the cache is full. */
    set(key, value) {
        if (this.store.size >= this.maxEntries) {
            const oldestKey = this.store.keys().next().value; // Map keeps insertion order
            this.store.delete(oldestKey);
        }
        this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
    }

    /** Removes everything (useful in tests). */
    clear() {
        this.store.clear();
    }
}
