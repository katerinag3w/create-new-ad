import ApiError from '../utils/ApiError.js';
import { AD_TYPES, PROPERTY_TYPES } from '../config/constants.js';
const isOptionalNonNegative = (v) => v === undefined || (typeof v === 'number' && v >= 0);
/**
* Validates the body of POST /api/ads.
* On failure → 400 { message, errors: { field: 'message' } }.
*/
export default function validateAd(req, res, next) {
    const { title, adType, propertyType, area, price, size, bedrooms } = req.body ?? {};
    const errors = {};
    if (typeof title !== 'string' || !title.trim()) errors.title = 'Title is required';
    if (!AD_TYPES.includes(adType)) errors.adType = 'Invalid ad type';
    if (!PROPERTY_TYPES.includes(propertyType)) errors.propertyType = 'Invalid property type';
    if (!area?.id || !area?.name) errors.area = 'Please select an area from the list';
    if (typeof price !== 'number' || price <= 0) errors.price = 'Price must be greater than 0';
    for (const [field, value] of Object.entries({ size, bedrooms })) {
        if (!isOptionalNonNegative(value)) errors[field] = 'Must be 0 or more';
    }
    if (Object.keys(errors).length > 0) {
        return next(new ApiError(400, 'Validation failed', errors));
    }
    next();
}
