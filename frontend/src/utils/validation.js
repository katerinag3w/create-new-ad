import { TITLE_MAX_LENGTH } from '../constants';

/**
 * Validates the create-ad form.
 * @returns {Object} errors keyed by field name; empty object = valid
 */
export function validateAd(values) {
    const errors = {};

    if (!values.title.trim()) errors.title = 'Title is required';
    else if (values.title.trim().length > TITLE_MAX_LENGTH) {
        errors.title = `Title can be up to ${TITLE_MAX_LENGTH} characters`;
    }
    if (!values.adType) errors.adType = 'Choose an ad type';
    if (!values.propertyType) errors.propertyType = 'Choose a property type';
    if (!values.area?.id) errors.area = 'Please select an area from the list';

    if (values.price === '' || Number(values.price) <= 0) {
        errors.price = 'Enter a price greater than 0';
    }

    for (const field of ['size', 'levels', 'bedrooms', 'bathrooms']) {
        if (values[field] !== '' && Number(values[field]) < 0) {
            errors[field] = 'Must be 0 or more';
        }
    }

    return errors;
}
