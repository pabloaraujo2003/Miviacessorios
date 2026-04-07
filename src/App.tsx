
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Saved } from './pages/Saved';
import { Search } from './pages/Search';
import { Admin } from './pages/Admin';
import { AppProvider } from './context/AppContext';
import { CartDrawer } from './components/CartDrawer';
import { MenuDrawer } from './components/MenuDrawer';

function App() {
  return (
    <Router>
      <AppProvider>
        <CartDrawer />
        <MenuDrawer />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/saved" element={<Saved />} />
          <Route path="/search" element={<Search />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </AppProvider>
    </Router>
  );
}

export default App;
