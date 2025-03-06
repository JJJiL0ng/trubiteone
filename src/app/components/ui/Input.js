// src/components/ui/Input.js
import React, { forwardRef } from 'react';

const Input = forwardRef(({
  type = 'text',
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  disabled = false,
  className = '',
  icon,
  helpText,
  ...rest
}, ref) => {
  // 기본 입력 필드 스타일
  const baseInputClasses = 'w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 transition-colors';
  
  // 에러 상태에 따른 스타일
  const inputClasses = `
    ${baseInputClasses}
    ${error 
      ? 'border-red-500 focus:ring-red-200' 
      : 'border-gray-300 focus:ring-blue-200 focus:border-blue-500'}
    ${icon ? 'pl-10' : ''}
    ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  // 라벨 ID 생성
  const inputId = name || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block mb-1 font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={inputClasses}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={helpText || error ? `${inputId}-description` : undefined}
          {...rest}
        />
      </div>
      
      {(error || helpText) && (
        <div id={`${inputId}-description`} className="mt-1 text-sm">
          {error && <p className="text-red-500">{error}</p>}
          {helpText && !error && <p className="text-gray-500">{helpText}</p>}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;