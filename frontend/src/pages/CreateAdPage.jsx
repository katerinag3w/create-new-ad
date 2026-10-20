import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AreaAutocomplete from '../components/AreaAutocomplete/AreaAutocomplete';
import FormField from '../components/FormField';
import { createAd } from '../api/ads';
import { validateAd } from '../utils/validation';
import { AD_TYPES, PROPERTY_TYPES, TITLE_MAX_LENGTH } from '../constants';

const INITIAL_VALUES = {
  title: '',
  adType: 'buy',
  propertyType: 'house',
  area: null,
  price: '',
  size: '',
  bedrooms: '',
  description: '',
};

const toNumber = (v) => (v === '' ? undefined : Number(v));

/** Converts form state (strings) into the shape the API expects. */
function toPayload(values) {
  return {
    title: values.title.trim(),
    adType: values.adType,
    propertyType: values.propertyType,
    area: { id: values.area.id, name: values.area.name },
    price: toNumber(values.price),
    size: toNumber(values.size),
    bedrooms: toNumber(values.bedrooms),
    description: values.description.trim(),
  };
}

/** Page with the form to create a new property ad. */
export default function CreateAdPage() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // One handler for all normal inputs, using the input's `name` attribute
  function handleChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  // Price: keep only digits (also blocks e, -, . and pasted text)
  function handleDigitsChange(e) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value.replace(/\D/g, '') }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleAreaChange(area) {
    setValues((prev) => ({ ...prev, area }));
    if (area) setErrors((prev) => ({ ...prev, area: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault(); // stop the browser from reloading the page

    const found = validateAd(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await createAd(toPayload(values));
      navigate('/ads');
    } catch (err) {
      if (err.errors) setErrors(err.errors); // field errors from the backend
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="page">
      <h1>New property</h1>

      {submitError && <div className="alert" role="alert">{submitError}</div>}

      <form className="ad-form" onSubmit={handleSubmit} noValidate>
        <FormField label="Title" htmlFor="title" error={errors.title} required>
          <input id="title" name="title" maxLength={TITLE_MAX_LENGTH}
            value={values.title} onChange={handleChange} />
        </FormField>

        <FormField label="Ad type" htmlFor="adType" error={errors.adType} required>
          <select id="adType" name="adType" value={values.adType} onChange={handleChange}>
            {AD_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Property type" htmlFor="propertyType" error={errors.propertyType} required>
          <select id="propertyType" name="propertyType" value={values.propertyType} onChange={handleChange}>
            {PROPERTY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </FormField>

        <FormField label="Area" htmlFor="area" error={errors.area} required>
          <AreaAutocomplete id="area" value={values.area} onChange={handleAreaChange} error={errors.area} />
        </FormField>

        <div className="form-grid">
          <FormField label="Price (€)" htmlFor="price" error={errors.price} required>
            <input id="price" name="price" type="text" inputMode="numeric"
              value={values.price} onChange={handleDigitsChange} />
          </FormField>
          <FormField label="Size (m²)" htmlFor="size" error={errors.size}>
            <input id="size" name="size" type="number" min="0" inputMode="numeric"
              value={values.size} onChange={handleChange} />
          </FormField>
          <FormField label="Bedrooms" htmlFor="bedrooms" error={errors.bedrooms}>
            <input id="bedrooms" name="bedrooms" type="number" min="0"
              value={values.bedrooms} onChange={handleChange} />
          </FormField>        </div>

        <FormField label="Description" htmlFor="description" error={errors.description}>
          <textarea id="description" name="description" rows="5"
            value={values.description} onChange={handleChange} />
        </FormField>

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Create ad'}
        </button>
      </form>
    </section>
  );
}
