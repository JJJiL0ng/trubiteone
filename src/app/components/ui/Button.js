// src/components/ui/Button.js
import React from 'react';
import Link from 'next/link';

const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  className = '', 
  variant = 'primary',
  href,
  size = 'medium',
  fullWidth = false,
  icon,
  ...rest 
}) => {
  // 버튼 변형에 따른 스타일
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    outline: 'border border-blue-600 text-blue-600 hover:bg-blue-50',
    ghost: 'text-blue-600 hover:bg-blue-50'
  };

  // 버튼 크기에 따른 스타일
  const sizeClasses = {
    small: 'py-1 px-3 text-sm',
    medium: 'py-2 px-4 text-base',
    large: 'py-3 px-6 text-lg'
  };

  // 버튼 기본 스타일
  const baseClasses = 'font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed';
  
  // 최종 클래스 결합
  const buttonClasses = `
    ${baseClasses} 
    ${variantClasses[variant] || variantClasses.primary} 
    ${sizeClasses[size] || sizeClasses.medium}
    ${fullWidth ? 'w-full' : ''}
    ${className}
    ${icon ? 'flex items-center justify-center' : ''}
  `.trim();

  // 버튼 컨텐츠
  const buttonContent = (
    <>
      {icon && <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>}
      {children}
    </>
  );

  // href 속성이 있으면 Link 컴포넌트로 렌더링
  if (href) {
    return (
      <Link href={href} className={buttonClasses} {...rest}>
        {buttonContent}
      </Link>
    );
  }

  // 일반 버튼으로 렌더링
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={buttonClasses}
      {...rest}
    >
      {buttonContent}
    </button>
  );
};

export default Button;