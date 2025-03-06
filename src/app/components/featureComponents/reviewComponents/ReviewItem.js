// src/components/featureComponents/reviewComponents/ReviewItem.js
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import useAuth from '@app/hooks/useAuth';
import useReviews from '@app/hooks/useReviews';
import { formatDate, timeAgo } from '@app/lib/utils';

/**
 * 개별 리뷰 아이템 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.review - 리뷰 데이터
 * @param {boolean} props.isDetail - 상세 페이지 여부 (기본값: false)
 * @param {Function} props.onDelete - 삭제 시 콜백 함수
 * @param {string} props.className - 추가 CSS 클래스
 */
const ReviewItem = ({
  review,
  isDetail = false,
  onDelete,
  className = ''
}) => {
  const { user } = useAuth();
  const { deleteReview } = useReviews();
  const [isDeleting, setIsDeleting] = useState(false);
  
  if (!review) return null;
  
  const {
    id,
    userId,
    placeId,
    placeName,
    placeAddress,
    photoURL,
    reviewText,
    createdAt,
    updatedAt
  } = review;
  
  const isOwner = user && user.uid === userId;
  const wasUpdated = updatedAt && createdAt && updatedAt.seconds > createdAt.seconds;
  
  // 기본 이미지 URL
  const defaultImageUrl = '/images/default-restaurant.jpg';
  
  // 리뷰 삭제 핸들러
  const handleDelete = async () => {
    if (!isOwner || isDeleting) return;
    
    if (confirm('정말로 이 리뷰를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      try {
        setIsDeleting(true);
        const success = await deleteReview(id);
        
        if (success && onDelete) {
          onDelete(id);
        }
      } catch (error) {
        console.error('리뷰 삭제 오류:', error);
        alert('리뷰 삭제 중 오류가 발생했습니다.');
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <div className={`border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* 이미지 섹션 */}
      <div className="relative w-full h-48">
        <Image
          src={photoURL || defaultImageUrl}
          alt={placeName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = defaultImageUrl;
            e.currentTarget.onerror = null;
          }}
        />
      </div>
      
      {/* 콘텐츠 섹션 */}
      <div className="p-4">
        {/* 식당 정보 */}
        <div className="mb-3">
          <h3 className="font-bold text-lg">
            {isDetail ? (
              placeName
            ) : (
              <Link href={`/reviews/${placeId}`} className="hover:text-blue-600">
                {placeName}
              </Link>
            )}
          </h3>
          
          <div className="flex items-center text-gray-600 text-sm mt-1">
            <FiMapPin className="mr-1" size={14} />
            <span>{placeAddress}</span>
          </div>
        </div>
        
        {/* 리뷰 텍스트 */}
        <div className={`mb-4 text-gray-700 ${isDetail ? '' : 'line-clamp-3'}`}>
          {reviewText}
        </div>
        
        {/* 날짜 및 액션 버튼 */}
        <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
          <div className="flex items-center">
            <FiCalendar className="mr-1" size={14} />
            <span>
              {isDetail 
                ? formatDate(createdAt)
                : timeAgo(createdAt)}
              {wasUpdated && ' (수정됨)'}
            </span>
          </div>
          
          {isOwner && (
            <div className="flex space-x-2">
              {/* 수정 버튼 */}
              <Link 
                href="/addMyFavorite"
                className="text-blue-500 hover:text-blue-600 flex items-center"
              >
                <FiEdit2 size={14} className="mr-1" />
                <span>수정</span>
              </Link>
              
              {/* 삭제 버튼 */}
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`text-red-500 hover:text-red-600 flex items-center ${
                  isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <FiTrash2 size={14} className="mr-1" />
                <span>{isDeleting ? '삭제 중...' : '삭제'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewItem;