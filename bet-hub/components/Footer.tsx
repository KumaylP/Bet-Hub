import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/10 bg-black py-8 px-6 text-center text-sm text-gray-600">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; 2026 Bet Hub. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;