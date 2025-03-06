// src/components/featureComponents/reviewComponents/ReviewForm.js
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiCamera, FiTrash2, FiSave, FiX } from 'react-icons/fi';
import useReviews from '@/app/hooks/useReviews';
import useAuth from '@/app/hooks/useAuth';
import PlaceSearch from '@/app/components/featureComponents/mapComponents/PlaceSearch';
import Spinner from '@/app/components/ui/Spinner';
import ErrorMessage from '@/app/components/ui/ErrorMessage';

/**
 * 리뷰 작성/수정 폼 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.initialPlace - 초기 장소 정보
 * @param {boolean} props.isEdit - 수정 모드 여부 (기본값: false)
 * @param {string} props.className - 추가 CSS 클래스
 */
const ReviewForm = ({
  initialPlace = null,
  isEdit = false,
  className = ''
}) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [imageError, setImageError] = useState(null);

  // 리뷰 상태 관리 훅 초기화
  const {
    reviewForm,
    photoFile,
    photoPreview,
    isLoading,
    error,
    userReview,
    handleImageSelect,
    handleImageRemove,
    handleReviewChange,
    setPlaceInfo,
    submitReview,
    deleteReview,
    clearError
  } = useReviews({
    loadUserReview: isEdit
  });

  // 초기 장소 정보 설정
  useEffect(() => {
    if (initialPlace && !isEdit) {
      setPlaceInfo(initialPlace);
    }
  }, [initialPlace, isEdit, setPlaceInfo]);

  // 파일 입력 핸들러
  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      setImageError('이미지 파일(JPG, PNG, GIF, WEBP)만 업로드 가능합니다.');
      return;
    }

    if (file.size > maxSize) {
      setImageError('파일 크기는 최대 5MB까지 가능합니다.');
      return;
    }

    setImageError(null);
    handleImageSelect(file);
  };

  // 리뷰 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!reviewForm.placeId) {
      alert('맛집을 선택해주세요.');
      return;
    }

    if (!reviewForm.reviewText.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }

    const success = await submitReview();
    if (success) {
      router.push('/');
    }
  };

  // 리뷰 삭제 핸들러
  const handleDelete = async () => {
    if (!isEdit || !userReview) return;

    if (confirm('정말로 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      const success = await deleteReview();
      if (success) {
        router.push('/');
      }
    }
  };

  // 취소 핸들러
  const handleCancel = () => {
    router.back();
  };

  // 장소 선택 핸들러
  const handlePlaceSelect = (place) => {
    if (place) {
      setPlaceInfo(place);
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-4 ${className}`}>
      {/* 폼 타이틀 */}
      <h1 className="text-2xl font-bold mb-6">
        {isEdit ? '나의 원픽 맛집 수정하기' : '나의 원픽 맛집 등록하기'}
      </h1>

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={clearError}
          className="mb-4"
        />
      )}

      <form onSubmit={handleSubmit}>
        {/* 장소 선택 섹션 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">
            맛집 선택 {reviewForm.placeId && <span className="text-green-500">✓</span>}
          </label>
          {isEdit ? (
            // 수정 모드에서는 장소 변경 불가
            <div className="p-4 border rounded bg-gray-50">
              <h3 className="font-bold">{reviewForm.placeName}</h3>
              <p className="text-sm text-gray-600">{reviewForm.placeAddress}</p>
            </div>
          ) : (
            // 등록 모드에서는 장소 검색 가능
            <div>
              <PlaceSearch
                onPlaceSelect={handlePlaceSelect}
                placeholder="맛집 이름을 검색하세요"
                className="mb-2"
              />
              {reviewForm.placeName && (
                <div className="p-4 border rounded mt-2">
                  <h3 className="font-bold">{reviewForm.placeName}</h3>
                  <p className="text-sm text-gray-600">{reviewForm.placeAddress}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 이미지 업로드 섹션 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">맛집 사진</label>
          <div className="flex items-start">
            {/* 이미지 미리보기 */}
            {photoPreview ? (
              <div className="relative mr-4">
                <img
                  src={photoPreview}
                  alt="맛집 사진 미리보기"
                  className="w-32 h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={handleImageRemove}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  aria-label="이미지 삭제"
                >
                  <FiX size={14} />
                </button>
              </div>
            ) : (
              // 이미지 업로드 버튼
              <div className="mr-4">
                <label className="block w-32 h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:border-blue-500">
                  <FiCamera size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">사진 추가</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-1">
                JPG, PNG, GIF, WEBP 파일 형식만 지원됩니다.
              </p>
              <p className="text-sm text-gray-500">
                최대 파일 크기: 5MB
              </p>
              {imageError && (
                <p className="text-sm text-red-500 mt-1">{imageError}</p>
              )}
            </div>
          </div>
        </div>

        {/* 리뷰 작성 섹션 */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2" htmlFor="reviewText">
            원픽 맛집 후기
          </label>
          <textarea
            id="reviewText"
            value={reviewForm.reviewText}
            onChange={(e) => handleReviewChange('reviewText', e.target.value)}
            placeholder="이 맛집을 당신의 원픽으로 선택한 이유를 공유해주세요."
            className="w-full p-3 border border-gray-300 rounded min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* 버튼 섹션 */}
        <div className="flex justify-between items-center mt-8">
          <div>
            {/* 취소 버튼 */}
            <button
              type="button"
              onClick={handleCancel}
              className="mr-4 px-5 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
            >
              취소
            </button>

            {/* 삭제 버튼 (수정 모드인 경우만) */}
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-5 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <FiTrash2 className="inline-block mr-1" />
                삭제
              </button>
            )}
          </div>

          {/* 저장 버튼 */}
          <button
            type="submit"
            disabled={isLoading}
            className={`px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <FiSave className="inline-block mr-1" />
            )}
            {isEdit ? '수정 완료' : '등록하기'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;