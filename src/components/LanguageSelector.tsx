import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLanguageChange } from '../hooks/useLanguageChange';
import { Globe } from 'lucide-react';

interface LanguageSelectorProps {
  className?: string;
  showLabel?: boolean;
  onChange?: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  showLabel = true,
  onChange
}) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const { forceUpdate } = useLanguageChange(); // Used to trigger re-render if language changes externally

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLanguage = event.target.value as 'es' | 'en' | 'pt';
    console.log('LanguageSelector - Changing language to:', newLanguage);
    setLanguage(newLanguage);
    onChange?.(newLanguage);
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {showLabel && (
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Idioma:</span>
        </div>
      )}
      <select
        value={currentLanguage}
        onChange={handleLanguageChange}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
    </div>
  );
};

export default LanguageSelector;
