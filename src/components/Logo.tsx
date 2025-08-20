import React from 'react';

interface LogoProps {
  className?: string;
  alt?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "h-10 w-auto", 
  alt = "PIEZAS YA Logo" 
}) => {
  return (
    <>
      {/* Logo para tema claro */}
      <img 
        src="/logo-piezasya-light.png"
        alt={alt}
        className={`${className} dark:hidden`}
      />
      {/* Logo para tema oscuro */}
      <img 
        src="/logo-piezasya-dark.png"
        alt={alt}
        className={`${className} hidden dark:block`}
      />
    </>
  );
};

export default Logo;
