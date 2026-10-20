import { NavLink, Route, Routes } from 'react-router-dom';
import CreateAdPage from './pages/CreateAdPage';
import AdsListPage from './pages/AdsListPage';
import AdDetailsPage from './pages/AdDetailsPage';


/** App shell: header navigation + page routes. */
export default function App() {
  return (
    <>
      <header className="site-header">
        <nav>
          <NavLink to="/" end>Create ad</NavLink>
          <NavLink to="/ads">Ads</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CreateAdPage />} />
          <Route path="/ads" element={<AdsListPage />} />
          <Route path="/ads/:id" element={<AdDetailsPage />} />
          <Route path="*" element={<p className="page">Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}
