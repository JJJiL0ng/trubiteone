// src/components/featureComponents/reviewComponents/PhotoUpload.js
'use client';

import { useState, useRef } from 'react';
import { FiCamera, FiTrash2, FiX } from 'react-icons/fi';
import { isImageFile, formatFileSize } from '@app/lib/utils';

/**
 * 사진 업로드 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.initialImage - 초기 이미지 URL
 * @param {Function} props.onImageSelect - 이미지 선택 시 콜백 함수
 * @param {Function} props.onImageRemove - 이미지 제거 시 콜백 함수
 * @param {string} props.className - 추가 CSS 클래스
 */
const PhotoUpload = ({
  initialImage = null,
  onImageSelect,
  onImageRemove,
  className = ''
}) => {
  const [preview, setPreview] = useState(initialImage);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // 유효성 검사
  const validateFile = (file) => {
    if (!file) return null;
    
    // 이미지 파일인지 확인
    if (!isImageFile(file)) {
      return '이미지 파일(JPG, PNG, GIF, WEBP)만 업로드 가능합니다.';
    }
    
    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return `파일 크기는 최대 5MB까지 가능합니다. (현재: ${formatFileSize(file.size)})`;
    }
    
    return null;
  };
  
  // 파일 처리
  const processFile = (file) => {
    // 이전 미리보기 URL 해제
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    
    // 유효성 검사
    const errorMessage = validateFile(file);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    
    // 미리보기 URL 생성
    const previewUrl = URL.createObjectURL(file);
    setPreview(previewUrl);
    setError(null);
    
    // 콜백 함수 호출
    if (onImageSelect) {
      onImageSelect(file);
    }
  };
  
  // 파일 입력 핸들러
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  // 이미지 제거 핸들러
  const handleRemove = () => {
    // 미리보기 URL 해제
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    
    // 상태 초기화
    setPreview(null);
    setError(null);
    
    // 파일 입력 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // 콜백 함수 호출
    if (onImageRemove) {
      onImageRemove();
    }
  };
  
  // 드래그 앤 드롭 이벤트 핸들러
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };
  
  return (
    <div className={`${className}`}>
      {/* 이미지 미리보기 */}
      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="이미지 미리보기"
            className="max-w-full max-h-64 rounded object-contain"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
            aria-label="이미지 삭제"
          >
            <FiX size={16} />
          </button>
        </div>
      ) : (
        // 파일 업로드 영역
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center justify-center">
            <FiCamera size={36} className="text-gray-400 mb-2" />
            <p className="text-gray-600 mb-1">이미지를 드래그하거나 클릭하여 업로드</p>
            <p className="text-xs text-gray-500">JPG, PNG, GIF, WEBP / 최대 5MB</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
      
      {/* 에러 메시지 */}
      {error && (
        <div className="mt-2 text-sm text-red-500">{error}</div>
      )}
    </div>
  );
};

export default PhotoUpload;