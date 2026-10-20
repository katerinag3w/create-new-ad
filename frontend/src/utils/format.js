/** Formats a number as euros, e.g. 150000 → "150.000 €" */
export const formatPrice = (value) =>
    new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })
        .format(value);

/** Finds the label of a value in an options list, e.g. 'buy' → 'Buy' */
export const labelOf = (options, value) =>
    options.find((o) => o.value === value)?.label ?? value;
