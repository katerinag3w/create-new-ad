import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getAd } from '../api/ads';
import { formatPrice, labelOf } from '../utils/format';
import { AD_TYPES, PROPERTY_TYPES } from '../constants';

/** Page that shows one saved ad (the form data that was persisted). */
export default function AdDetailsPage() {
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setAd(null);
    setError('');

    getAd(id, controller.signal)
      .then(setAd)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      });

    return () => controller.abort();
  }, [id]);

  if (error) {
    return (
      <section className="page">
        <div className="alert" role="alert">{error}</div>
        <Link to="/ads">Back to ads</Link>
      </section>
    );
  }

  if (!ad) return <p className="page">Loading…</p>;

  // Optional fields are shown only if they were filled in
  const optional = [
    ['Size', ad.size != null && `${ad.size} m²`],
    ['Levels', ad.levels],
    ['Bedrooms', ad.bedrooms],
    ['Bathrooms', ad.bathrooms],
  ].filter(([, value]) => value != null && value !== false);

  return (
    <section className="page">
      <Link to="/ads">← Back to ads</Link>
      <h1>{ad.title}</h1>
      <p className="ad-card__price">{formatPrice(ad.price)}</p>

      <dl className="details">
        <div>
          <dt>Ad type</dt>
          <dd>{labelOf(AD_TYPES, ad.adType)}</dd>
        </div>
        <div>
          <dt>Property type</dt>
          <dd>{labelOf(PROPERTY_TYPES, ad.propertyType)}</dd>
        </div>
        <div>
          <dt>Area</dt>
          <dd>{ad.area.name}</dd>
        </div>
        {optional.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      {ad.description && (
        <>
          <h2>Description</h2>
          <p>{ad.description}</p>
        </>
      )}
    </section>
  );
}
