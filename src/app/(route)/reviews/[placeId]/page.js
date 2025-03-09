// src/app/reviews/[placeId]/page.js
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { FiMapPin, FiArrowLeft, FiMap, FiPlusCircle } from 'react-icons/fi';
import useReviews from '@app/hooks/useReviews';
import usePlaces from '@app/hooks/usePlaces';
import useAuth from '@app/hooks/useAuth';
import ReviewList from '@app/components/featureComponents/reviewComponents/ReviewList';
import Spinner from '@app/components/ui/Spinner';
import ErrorMessage from '@app/components/ui/ErrorMessage';

export default function PlaceReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { placeId } = params;
  const [place, setPlace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // 훅 초기화
  const { loadReviews } = useReviews({ placeId });
  const { getPlaceDetails } = usePlaces();
  const { isAuthenticated, hasFavoritePlace } = useAuth();
  
  // 장소 정보 로드
  useEffect(() => {
    const loadPlaceData = async () => {
      if (!placeId) {
        router.push('/');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // 장소 상세 정보 가져오기
        const placeData = await getPlaceDetails(placeId);
        
        if (placeData) {
          setPlace(placeData);
          // 타이틀 업데이트
          document.title = `${placeData.name} - 원픽맛집`;
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
    
    loadPlaceData();
  }, [placeId, getPlaceDetails, router]);
  
  // 에러 메시지 초기화
  const clearError = () => {
    setError(null);
  };
  
  // 지도로 돌아가기
  const goBack = () => {
    router.back();
  };
  
  // 로딩 중이면 스피너 표시
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Spinner size="lg" />
      </div>
    );
  }
  
  return (
    <div className="py-4 px-4 max-w-4xl mx-auto">
      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={clearError}
          className="mb-6"
        />
      )}
      
      {/* 뒤로 가기 */}
      <button
        onClick={goBack}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
      >
        <FiArrowLeft className="mr-1" />
        <span>뒤로 가기</span>
      </button>
      
      {place && (
        <>
          {/* 장소 정보 */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-2xl font-bold mb-2">{place.name}</h1>
            
            <div className="flex items-center text-gray-600 mb-4">
              <FiMapPin className="mr-1" />
              <span>{place.address}</span>
            </div>
            
            {/* 액션 버튼 */}
            <div className="flex flex-wrap gap-3 mt-4">
              {/* 지도에서 보기 */}
              <Link 
                href={`/?placeId=${place.id}`}
                className="flex items-center py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <FiMap className="mr-2" />
                <span>지도에서 보기</span>
              </Link>
              
              {/* 원픽 등록 버튼 (로그인 상태이고 아직 원픽을 등록하지 않은 경우) */}
              {isAuthenticated && !hasFavoritePlace && (
                <Link 
                  href={`/addMyFavorite?placeId=${place.id}`}
                  className="flex items-center py-2 px-4 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <FiPlusCircle className="mr-2" />
                  <span>내 원픽으로 등록</span>
                </Link>
              )}
            </div>
          </div>
          
          {/* 리뷰 목록 */}
          <div className="mb-8">
            <ReviewList
              placeId={placeId}
              placeName={place.name}
              showHeader={true}
            />
          </div>
        </>
      )}
    </div>
  );
}