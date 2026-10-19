/** Formats a number as euros, e.g. 150000 → "150.000 €" */
export const formatPrice = (value) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
        .format(value);