/**
 * Validates the create-ad form.
 * @returns {Object} errors keyed by field name; empty object = valid
 */
export function validateAd(values) {
    const errors = {};

    if (!values.title.trim()) errors.title = 'Title is required';
    if (!values.adType) errors.adType = 'Choose sale or rent';

    if (values.price === '' || Number(values.price) <= 0) {
        errors.price = 'Enter a price greater than 0';
    }



    return errors;
}
