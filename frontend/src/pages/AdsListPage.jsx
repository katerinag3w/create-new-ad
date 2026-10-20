import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listAds } from '../api/ads';
import { formatPrice, labelOf } from '../utils/format';
import { AD_TYPES, PROPERTY_TYPES } from '../constants';

/** Page that lists all saved ads. */
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
            <Link to={`/ads/${ad._id}`}>
              <h2>{ad.title}</h2>
              <p>
                {labelOf(PROPERTY_TYPES, ad.propertyType)} · {labelOf(AD_TYPES, ad.adType)} · {ad.area.name}
              </p>
              <span className="ad-card__price">{formatPrice(ad.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
