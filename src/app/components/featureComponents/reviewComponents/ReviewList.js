// src/components/featureComponents/reviewComponents/ReviewList.js
'use client';

import { useEffect, useState } from 'react';
import useReviews from '@app/hooks/useReviews';
import ReviewItem from '@app/components/featureComponents/reviewComponents/ReviewItem';
import Spinner from '@app/components/ui/Spinner';
import ErrorMessage from '@app/components/ui/ErrorMessage';

/**
 * 리뷰 목록 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.placeId - 장소 ID (필수)
 * @param {string} props.placeName - 장소 이름
 * @param {boolean} props.showHeader - 헤더 표시 여부 (기본값: true)
 * @param {boolean} props.emptyMessage - 리뷰가 없을 때 표시할 메시지 (기본값: '아직 작성된 리뷰가 없습니다.')
 * @param {string} props.className - 추가 CSS 클래스
 */
const ReviewList = ({
  placeId,
  placeName = '',
  showHeader = true,
  emptyMessage = '아직 작성된 리뷰가 없습니다.',
  className = ''
}) => {
  const [refreshKey, setRefreshKey] = useState(0);
  
  // 리뷰 훅 초기화
  const { reviews, isLoading, error, loadReviews, clearError } = useReviews({
    placeId
  });
  
  // 리뷰 새로고침
  const refreshReviews = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  // 리뷰 삭제 핸들러
  const handleReviewDelete = async (reviewId) => {
    refreshReviews();
  };
  
  // 컴포넌트 마운트 시 리뷰 로드
  useEffect(() => {
    if (placeId) {
      loadReviews(placeId);
    }
  }, [placeId, loadReviews, refreshKey]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }
  
  if (error) {
    return (
      <ErrorMessage
        message={error}
        onClose={clearError}
        className="my-4"
      />
    );
  }
  
  return (
    <div className={className}>
      {/* 헤더 */}
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            {placeName ? `${placeName} 리뷰` : '리뷰'}
            {reviews.length > 0 && <span className="ml-2 text-gray-500">({reviews.length})</span>}
          </h2>
        </div>
      )}
      
      {/* 리뷰 목록 */}
      {reviews.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {reviews.map(review => (
            <ReviewItem
              key={review.id}
              review={review}
              onDelete={handleReviewDelete}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default ReviewList;