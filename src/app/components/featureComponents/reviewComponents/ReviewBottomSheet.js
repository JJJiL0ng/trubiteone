// src/components/featureComponents/reviewComponents/ReviewBottomSheet.js
'use client';

import { useState, useEffect } from 'react';
import { FiStar, FiUsers, FiMap, FiExternalLink, FiX } from 'react-icons/fi';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Spinner from '@app/components/ui/Spinner';
import useAuth from '@app/hooks/useAuth';
import useReviews from '@app/hooks/useReviews';

// 바텀시트 상태를 전역으로 관리하기 위한 커스텀 이벤트
const bottomSheetEvent = typeof window !== 'undefined' ? new CustomEvent('bottomSheetStateChange', { detail: { isFullyOpen: false } }) : null;

/**
 * 장소 리뷰를 위한 바텀시트 컴포넌트
 */
const ReviewBottomSheet = ({ 
  isOpen, 
  onClose, 
  place,
  onAddFavorite 
}) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [reviewCount, setReviewCount] = useState(0);
  const [sheetPosition, setSheetPosition] = useState(0); // 0: 가장 아래, 1: 가장 위
  const [dragging, setDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [deltaY, setDeltaY] = useState(0);
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { loadReviews } = useReviews();

  // 바텀시트 스냅 포인트 (화면 높이 기준 퍼센트)
  const snapPoints = [25, 88]; // 중간 단계(50%) 제거

  // 장소가 변경되면 리뷰 데이터 로드
  useEffect(() => {
    if (place && isOpen) {
      setLoading(true);
      
      const fetchReviews = async () => {
        try {
          // API 호출 대신 useReviews 훅 사용
          const reviewsData = await loadReviews(place.id);
          
          setReviews(reviewsData || []);
          setReviewCount(reviewsData?.length || 0);
        } catch (error) {
          console.error('리뷰 데이터 로드 중 오류 발생:', error);
          setReviews([]);
          setReviewCount(0);
        } finally {
          setLoading(false);
        }
      };
      
      fetchReviews();
    }
  }, [place, isOpen, loadReviews]);

  // isOpen 상태가 변경될 때 sheetPosition 초기화
  useEffect(() => {
    if (isOpen) {
      setSheetPosition(0); // 바텀시트가 열릴 때 항상 가장 낮은 위치에서 시작
    }
  }, [isOpen]);

  // sheetPosition이 변경될 때마다 이벤트 발생
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isFullyOpen = sheetPosition === 1;
      const event = new CustomEvent('bottomSheetStateChange', { 
        detail: { isFullyOpen } 
      });
      window.dispatchEvent(event);
    }
  }, [sheetPosition]);

  const handleViewAllReviews = () => {
    if (place) {
      router.push(`/reviews/${place.id}`);
    }
  };

  const handleAddFavorite = () => {
    if (onAddFavorite && place) {
      onAddFavorite(place);
    }
  };

  // 드래그 시작 핸들러
  const handleDragStart = (e) => {
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    setStartY(clientY);
    setDragging(true);
  };

  // 드래그 중 핸들러
  const handleDrag = (e) => {
    if (!dragging) return;
    
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const currentDeltaY = clientY - startY;
    setDeltaY(currentDeltaY);
  };

  // 드래그 종료 핸들러
  const handleDragEnd = () => {
    if (!dragging) return;
    
    // 드래그 방향에 따라 다음 스냅 포인트 결정
    if (Math.abs(deltaY) > 50) { // 50px 이상 드래그했을 때만 반응
      if (deltaY > 0 && sheetPosition > 0) {
        // 아래로 드래그: 더 낮은 스냅 포인트로
        setSheetPosition(sheetPosition - 1);
      } else if (deltaY < 0 && sheetPosition < snapPoints.length - 1) {
        // 위로 드래그: 더 높은 스냅 포인트로
        setSheetPosition(sheetPosition + 1);
      } else if (deltaY > 100 && sheetPosition === 0) {
        // 가장 낮은 상태에서 아래로 많이 드래그: 닫기
        onClose();
      }
    }
    
    setDragging(false);
    setDeltaY(0);
  };

  // 가장 낮은 스냅 포인트에서 아래로 드래그하면 바텀시트 닫기
  const handleClose = () => {
    if (sheetPosition === 0) {
      onClose();
    } else {
      setSheetPosition(0);
    }
  };

  if (!place || !isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 pointer-events-none ${sheetPosition === 1 ? 'bottom-sheet-fully-open' : ''}`}>
      {/* 배경 오버레이 - 바텀시트가 열려있을 때만 활성화 */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-300
                   ${isOpen ? (sheetPosition > 0 ? 'bg-opacity-50 pointer-events-auto' : 'bg-opacity-0') : 'bg-opacity-0'}`}
        onClick={handleClose}
      />
      
      {/* 바텀시트 */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-lg overflow-hidden pointer-events-auto
                   ${sheetPosition === 1 ? 'z-[9999]' : ''}`}
        style={{
          height: `${snapPoints[sheetPosition]}vh`,
          transform: dragging ? `translateY(${deltaY}px)` : 'translateY(0)',
          transition: dragging ? 'none' : 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)',
        }}
        onTouchStart={handleDragStart}
        onTouchMove={handleDrag}
        onTouchEnd={handleDragEnd}
        onMouseDown={handleDragStart}
        onMouseMove={handleDrag}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {/* 드래그 핸들 */}
        <div className="w-full flex justify-center p-2 cursor-grab">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>
        
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 p-2 text-gray-500 hover:text-gray-700"
          aria-label="닫기"
        >
          <FiX />
        </button>
        
        <div className="px-4 py-2 h-full overflow-y-auto">
          {/* 장소 정보 */}
          <h2 className="text-xl font-bold mb-1">{place.name}</h2>
          <p className="text-gray-600 text-sm mb-3">{place.address}</p>
          
          {/* 메타 정보 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <FiUsers className="text-blue-500 mr-1" />
                <span className="text-sm">{reviewCount} 리뷰</span>
              </div>
            </div>
            
            {/* 외부 링크 (Google Maps) */}
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 flex items-center"
            >
              <FiExternalLink className="mr-1" />
              <span className="text-sm">지도에서 보기</span>
            </a>
          </div>
          
          {/* 버튼 그룹 */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={handleViewAllReviews}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md flex items-center justify-center"
            >
              모든 리뷰 보기
            </button>
            
            {isAuthenticated && (
              <button
                onClick={handleAddFavorite}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md flex items-center justify-center"
              >
                원픽 등록하기
              </button>
            )}
          </div>
          
          {/* 리뷰 목록 */}
          <div className="pb-4">
            <h3 className="font-semibold text-lg mb-2">리뷰 미리보기</h3>
            
            {loading ? (
              <div className="flex justify-center py-8">
                <Spinner size="md" />
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.slice(0, 3).map((review) => (
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
                          {new Date(review.createdAt).toLocaleDateString()}
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
            ) : (
              <p className="text-gray-500 text-center py-6">
                아직 등록된 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewBottomSheet;