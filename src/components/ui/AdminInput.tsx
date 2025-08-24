import React from 'react';

interface AdminInputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  label?: string;
  error?: string;
  helperText?: string;
}

const AdminInput: React.FC<AdminInputProps> = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  name,
  id,
  required = false,
  disabled = false,
  readOnly = false,
  className = '',
  label,
  error,
  helperText
}) => {
  const baseClasses = "w-full px-3 py-2 border rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-0";
  const stateClasses = error 
    ? "border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500" 
    : "border-gray-300 dark:border-gray-600 focus:ring-[#FFC300] focus:border-[#FFC300]";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const inputClasses = `${baseClasses} ${stateClasses} ${disabledClasses} bg-white dark:bg-[#444444] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${className}`;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id || name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        className={inputClasses}
      />
      
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helperText}
        </p>
      )}
    </div>
  );
};

export default AdminInput;
