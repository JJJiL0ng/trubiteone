//src/app/components/featureComponents/reviewComponents/ReviewPreviewList.js
'use client';

import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

/**
 * 리뷰 미리보기 목록 컴포넌트
 */
const ReviewPreviewList = ({ reviews = [], maxReviews = 3 }) => {
  // 최대 표시할 리뷰 수만큼 자르기
  const displayReviews = reviews.slice(0, maxReviews);
  
  return (
    <div className="space-y-4">
      {displayReviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-4 last:border-0">
          <div className="flex items-center mb-2">
            {/* 사용자 프로필 */}
            {review.userPhotoURL ? (
              <Image
                src={review.userPhotoURL}
                alt={review.userName || '사용자'}
                width={32}
                height={32}
                className="rounded-full mr-2"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-full mr-2 flex items-center justify-center">
                <span className="text-gray-500 text-sm">
                  {review.userName ? review.userName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
            )}
            
            <div>
              <p className="font-medium">{review.userName || '익명 사용자'}</p>
              <p className="text-xs text-gray-500">
                {review.createdAt instanceof Date 
                  ? formatDistanceToNow(review.createdAt, { addSuffix: true, locale: ko })
                  : review.createdAt?.toDate 
                    ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true, locale: ko })
                    : '등록일 정보 없음'
                }
              </p>
            </div>
          </div>
          
          <p className="text-sm text-gray-700 line-clamp-3">{review.reviewText}</p>
          
          {/* 리뷰 사진이 있는 경우 */}
          {review.photoURL && (
            <div className="mt-2">
              <Image
                src={review.photoURL}
                alt="리뷰 사진"
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewPreviewList;