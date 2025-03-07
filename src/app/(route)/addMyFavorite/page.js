// src/app/addMyFavorite/page.js
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthGuard from '@app/components/featureComponents/authComponents/AuthGuard';
import ReviewForm from '@app/components/featureComponents/reviewComponents/ReviewForm';
import useAuth from '@app/hooks/useAuth';
import usePlaces from '@app/hooks/usePlaces';
import useReviews from '@app/hooks/useReviews';
import Spinner from '@app/components/ui/Spinner';
import ErrorMessage from '@app/components/ui/ErrorMessage';

export default function AddMyFavoritePage() {
  const searchParams = useSearchParams();
  const placeId = searchParams.get('placeId');
  const [initialPlace, setInitialPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(!!placeId);
  const [error, setError] = useState(null);
  
  // 인증 확인 (이 페이지는 로그인이 필요함)
  const { user, isAuthenticated, userData, hasFavoritePlace } = useAuth();
  const { getPlaceDetails } = usePlaces();
  const { userReview } = useReviews({ loadUserReview: true });
  
  // 편집 모드 여부 확인 (사용자가 이미 원픽 맛집을 등록했으면 편집 모드)
  const isEditMode = !!userReview;
  
  // 타이틀 업데이트
  useEffect(() => {
    document.title = isEditMode 
      ? '나의 원픽 맛집 수정하기 - 원픽맛집'
      : '나의 원픽 맛집 등록하기 - 원픽맛집';
  }, [isEditMode]);
  
  // URL 파라미터에 placeId가 있으면 해당 장소 정보 가져오기
  useEffect(() => {
    const loadPlaceDetails = async () => {
      if (!placeId || isEditMode) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const place = await getPlaceDetails(placeId);
        
        if (place) {
          setInitialPlace(place);
        } else {
          setError('해당 장소를 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('장소 정보 로드 오류:', err);
        setError('장소 정보를 가져오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPlaceDetails();
  }, [placeId, getPlaceDetails, isEditMode]);
  
  // 에러 메시지 초기화
  const clearError = () => {
    setError(null);
  };
  
  return (
    <AuthGuard 
      redirectTo="/login"
      redirectIfHasFavorite={false}
    >
      <div className="py-8 px-4 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {error && (
              <ErrorMessage
                message={error}
                onClose={clearError}
                className="mb-6"
              />
            )}
            
            <ReviewForm
              initialPlace={initialPlace}
              isEdit={isEditMode}
            />
          </>
        )}
      </div>
    </AuthGuard>
  );
}