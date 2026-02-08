import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import PublicDashboard from './pages/PublicDashboard';
import PrivateDashboard from './pages/PrivateDashboard';
import CreateMarket from './pages/CreateMarket';
import MarketDetail from './pages/MarketDetail';
import LoanPage from './pages/LoanPage';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

import { AuthProvider } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';

const App: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  return (
    <AuthProvider>
      <HashRouter>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col bg-background-dark text-white font-sans selection:bg-primary selection:text-white">
          <Navbar onSearchChange={setSearchQuery} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<PublicDashboard searchQuery={searchQuery} />} />
              <Route path="/private" element={<PrivateDashboard />} />
              <Route path="/create" element={<CreateMarket />} />
              <Route path="/loans" element={<LoanPage />} />
              <Route path="/market/:id" element={<MarketDetail />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;