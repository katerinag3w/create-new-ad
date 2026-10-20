import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAds } from '../api/ads';
import { formatPrice, labelOf } from '../utils/format';
import { AD_TYPES, PROPERTY_TYPES } from '../constants';

/** Page that shows all saved ads (the persisted form data). */
export default function AdsListPage() {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    listAds(controller.signal)
      .then(setAds)
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="page">
      <h1>Ads</h1>

      {loading && <p>Loading…</p>}
      {error && <div className="alert" role="alert">{error}</div>}
      {!loading && !error && ads.length === 0 && (
        <p>No ads yet. <Link to="/">Create the first one</Link>.</p>
      )}

      <ul className="ad-list">
        {ads.map((ad) => (
          <li key={ad._id} className="ad-card">
            <h2>{ad.title}</h2>
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
              {/* Optional fields are shown only if they were filled in */}
              {ad.size != null && (
                <div>
                  <dt>Size</dt>
                  <dd>{ad.size} m²</dd>
                </div>
              )}
              {ad.bedrooms != null && (
                <div>
                  <dt>Bedrooms</dt>
                  <dd>{ad.bedrooms}</dd>
                </div>
              )}
            </dl>

            {ad.description && <p className="ad-card__description">{ad.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}
