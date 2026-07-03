
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { CartDrawer } from './components/CartDrawer';
import { MenuDrawer } from './components/MenuDrawer';

// Lazy loading pages
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const Saved = lazy(() => import('./pages/Saved').then(m => ({ default: m.Saved })));
const Search = lazy(() => import('./pages/Search').then(m => ({ default: m.Search })));
const Admin = lazy(() => import('./pages/Admin').then(m => ({ default: m.Admin })));

const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AppProvider>
        <div aria-hidden="true" className="grain-overlay" />
        <CartDrawer />
        <MenuDrawer />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/search" element={<Search />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </AppProvider>
    </Router>
  );
}

export default App;
