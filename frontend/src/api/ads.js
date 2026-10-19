import { request } from './client';

/** Create a new ad. Returns the saved ad */
export const createAd = (ad) => request('/ads', { method: 'POST', body: ad });

