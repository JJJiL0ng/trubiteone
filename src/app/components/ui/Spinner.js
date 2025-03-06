// src/components/ui/Spinner.js
import React from 'react';

const Spinner = ({ 
  size = 'medium', 
  color = 'primary', 
  className = '',
  text
}) => {
  // 크기 클래스
  const sizeClasses = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-3',
    large: 'h-12 w-12 border-4'
  };
  
  // 색상 클래스
  const colorClasses = {
    primary: 'border-blue-500',
    secondary: 'border-gray-500',
    success: 'border-green-500',
    danger: 'border-red-500',
    warning: 'border-yellow-500',
    white: 'border-white'
  };
  
  // 스피너 클래스
  const spinnerClasses = `
    inline-block rounded-full
    animate-spin
    border-t-transparent
    border-solid
    ${sizeClasses[size] || sizeClasses.medium}
    ${colorClasses[color] || colorClasses.primary}
    ${className}
  `.trim();
  
  // 전체 화면을 덮는 오버레이 스피너 생성
  const createOverlaySpinner = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className={spinnerClasses}></div>
        {text && <p className="mt-4 text-center text-gray-700">{text}</p>}
      </div>
    </div>
  );
  
  // 인라인 스피너 생성
  const createInlineSpinner = () => (
    <div className="flex items-center justify-center">
      <div className={spinnerClasses}></div>
      {text && <p className="ml-3 text-gray-700">{text}</p>}
    </div>
  );
  
  return text === 'overlay' ? createOverlaySpinner() : createInlineSpinner();
};

export default Spinner;