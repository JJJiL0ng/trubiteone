// src/components/ui/Modal.js
'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
}) => {
  const modalRef = useRef(null);
  
  // 모달 크기에 따른 클래스
  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4'
  };
  
  // ESC 키를 눌렀을 때 모달 닫기
  useEffect(() => {
    const handleEscape = (e) => {
      if (isOpen && e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    
    // 모달이 열리면 body 스크롤 막기
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
  
  // 모달 외부 클릭 시 닫기
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  // 클라이언트 사이드에서만 실행
  if (typeof window === 'undefined') return null;
  
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div 
        ref={modalRef}
        className={`
          bg-white rounded-lg shadow-xl w-full overflow-hidden
          ${sizeClasses[size] || sizeClasses.medium}
          ${className}
        `}
      >
        {/* 모달 헤더 */}
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center px-6 py-4 border-b">
            {title && (
              <h3 id="modal-title" className="text-lg font-semibold">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                aria-label="닫기"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* 모달 내용 */}
        <div className="px-6 py-4">
          {children}
        </div>
        
        {/* 모달 푸터 */}
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-2">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// 기본 확인/취소 모달
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'primary',
  ...rest
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
          <Button variant={confirmVariant} onClick={onConfirm}>{confirmText}</Button>
        </>
      }
      {...rest}
    >
      <p>{message}</p>
    </Modal>
  );
};

export default Modal;