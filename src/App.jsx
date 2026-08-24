import { Routes, Route } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { Login } from './pages/Login';

export function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<div className="plai-section">QuizzPLAI — en construction</div>} />
      </Routes>
      <Footer />
    </>
  );
}
