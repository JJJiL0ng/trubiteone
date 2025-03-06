// src/components/ui/ErrorMessage.js
import React from 'react';

const ErrorMessage = ({
  message,
  title = '오류',
  status,
  retry,
  className = ''
}) => {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-md p-4 ${className}`} role="alert">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          {title && <h3 className="text-sm font-medium text-red-800">{title}</h3>}
          <div className="mt-1 text-sm text-red-700">
            {message}
            {status && <div className="mt-1 text-xs text-red-600">상태 코드: {status}</div>}
          </div>
          {retry && (
            <div className="mt-3">
              <button
                type="button"
                onClick={retry}
                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
              >
                다시 시도
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;