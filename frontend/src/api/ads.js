import { request } from './client';

/** Create a new ad. Returns the saved ad */
export const createAd = (ad) => request('/ads', { method: 'POST', body: ad });

/** All ads, newest first. */
export const listAds = (signal) => request('/ads', { signal });

/** One ad by its id. */
export const getAd = (id, signal) => request(`/ads/${encodeURIComponent(id)}`, { signal });
