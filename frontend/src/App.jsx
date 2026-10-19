import { NavLink, Route, Routes } from 'react-router-dom';
import CreateAdPage from './pages/CreateAdPage';


/** App shell: header navigation + page routes. */
export default function App() {
  return (
    <>
      <header className="site-header">
        <nav>
          <NavLink to="/" end>Create ad</NavLink>
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<CreateAdPage />} />
          <Route path="*" element={<p className="page">Page not found</p>} />
        </Routes>
      </main>
    </>
  );
}

