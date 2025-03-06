// src/components/ui/Card.js
import React from 'react';
import Link from 'next/link';

const Card = ({
  children,
  title,
  footer,
  className = '',
  href,
  onClick,
  hoverable = false,
  bordered = true,
  shadow = true,
  padding = true,
  ...rest
}) => {
  // 카드 기본 스타일
  const cardClasses = `
    bg-white rounded-lg overflow-hidden
    ${bordered ? 'border border-gray-200' : ''}
    ${shadow ? 'shadow-sm' : ''}
    ${hoverable ? 'transition-shadow hover:shadow-md' : ''}
    ${padding ? '' : 'p-0'}
    ${className}
  `.trim();
  
  // 카드 내용
  const cardContent = (
    <>
      {title && (
        <div className={`font-medium text-lg ${padding ? 'px-6 py-4' : 'p-4'} border-b border-gray-200`}>
          {title}
        </div>
      )}
      <div className={padding ? 'px-6 py-4' : ''}>
        {children}
      </div>
      {footer && (
        <div className={`${padding ? 'px-6 py-4' : 'p-4'} bg-gray-50 border-t border-gray-200`}>
          {footer}
        </div>
      )}
    </>
  );
  
  // 링크로 사용될 경우
  if (href) {
    return (
      <Link href={href} className={cardClasses} {...rest}>
        {cardContent}
      </Link>
    );
  }
  
  // 클릭 가능한 카드
  if (onClick) {
    return (
      <div 
        className={`${cardClasses} cursor-pointer`} 
        onClick={onClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            onClick(e);
          }
        }}
        {...rest}
      >
        {cardContent}
      </div>
    );
  }
  
  // 일반 카드
  return (
    <div className={cardClasses} {...rest}>
      {cardContent}
    </div>
  );
};

export default Card;