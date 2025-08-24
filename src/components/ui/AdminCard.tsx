import React from 'react';

interface AdminCardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  showHeader?: boolean;
}

const AdminCard: React.FC<AdminCardProps> = ({ 
  title, 
  children, 
  className = '',
  headerClassName = '',
  bodyClassName = '',
  showHeader = true
}) => {
  return (
    <div className={`bg-white dark:bg-[#333333] rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}>
      {showHeader && title && (
        <div className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${headerClassName}`}>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
};

export default AdminCard;
