import React from 'react';
import Navbar from './NavBar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#14181c] text-white">
      <Navbar />
      <main className="pt-[72px]">
        {children}
      </main>
    </div>
  );
};

export default Layout;