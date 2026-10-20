import mongoose from 'mongoose';
import Ad from '../models/Ad.js';
import ApiError from '../utils/ApiError.js';
/** POST /api/ads – create a new ad (body already validated). */
export async function createAd(req, res) {
    const { title, adType, propertyType, area, price, size, levels, bedrooms, bathrooms, description } =
        req.body;
    const ad = await Ad.create({
        title, adType, propertyType,
        area: { id: String(area.id), name: area.name },
        price, size, levels, bedrooms, bathrooms, description,
    });
    res.status(201).json(ad);
}
/** GET /api/ads – newest first. */
export async function listAds(req, res) {
    const ads = await Ad.find().sort({ createdAt: -1 }).limit(100);
    res.json(ads);
}
/** GET /api/ads/:id – one ad, 404 if missing. */
export async function getAd(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) throw new ApiError(400, 'Invalid ad id');
    const ad = await Ad.findById(id);
    if (!ad) throw new ApiError(404, 'Ad not found');
    res.json(ad);
}
