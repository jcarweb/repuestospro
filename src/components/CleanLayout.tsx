import React from 'react';

interface CleanLayoutProps {
  children: React.ReactNode;
}

const CleanLayout: React.FC<CleanLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout completamente limpio - sin Header, Sidebar, Footer ni ningún elemento de sesión */}
      {children}
    </div>
  );
};

export default CleanLayout;
