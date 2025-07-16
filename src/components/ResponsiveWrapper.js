import React from 'react';

const ResponsiveWrapper = ({ children, className = '' }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full overflow-x-auto">
        <div className="min-w-full">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsiveWrapper;
