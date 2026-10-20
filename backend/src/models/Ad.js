import mongoose from 'mongoose';
import { AD_TYPES, PROPERTY_TYPES } from '../config/constants.js';

/**
 * A property ad created by a visitor.
 * `area` stores both the id (from the autocomplete API) and the display name.
 */
const adSchema = new mongoose.Schema(
    {
        title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 155 },
        adType: { type: String, enum: AD_TYPES, required: [true, 'Ad type is required'] },
        propertyType: { type: String, enum: PROPERTY_TYPES, required: [true, 'Property type is required'] },
        area: {
            id: { type: String, required: [true, 'Area is required'] },
            name: { type: String, required: [true, 'Area is required'] },
        },
        price: { type: Number, required: [true, 'Price is required'], min: [1, 'Price must be greater than 0'] },
        size: { type: Number, min: 0 },
        bedrooms: { type: Number, min: 0 },
        description: { type: String, trim: true, maxlength: 2000 },
    },
    { timestamps: true }, // adds createdAt / updatedAt
);

export default mongoose.model('Ad', adSchema);
