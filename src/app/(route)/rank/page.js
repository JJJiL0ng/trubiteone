// src/app/rank/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiMapPin, FiAward, FiUsers, FiChevronRight } from 'react-icons/fi';
import useReviews from '@app/hooks/useReviews';
import Spinner from '@app/components/ui/Spinner';
import ErrorMessage from '@app/components/ui/ErrorMessage';

export default function RankPage() {
  const router = useRouter();
  const { topPlaces, loadTopPlaces, isLoading, error, clearError } = useReviews();
  const [displayPlaces, setDisplayPlaces] = useState([]);
  
  // 타이틀 업데이트
  useEffect(() => {
    document.title = '인기 맛집 랭킹 - 원픽맛집';
  }, []);
  
  // 인기 장소 로드
  useEffect(() => {
    const fetchTopPlaces = async () => {
      const places = await loadTopPlaces(20); // 상위 20개 장소 로드
      setDisplayPlaces(places);
    };
    
    fetchTopPlaces();
  }, [loadTopPlaces]);
  
  // 장소 상세 페이지로 이동
  const navigateToPlace = (placeId) => {
    if (placeId) {
      router.push(`/reviews/${placeId}`);
    }
  };
  
  // 메달 색상 (1-3위)
  const medalColors = {
    0: 'text-yellow-500', // 금메달
    1: 'text-gray-400',   // 은메달
    2: 'text-amber-700'   // 동메달
  };
  
  return (
    <div className="py-8 px-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2 flex items-center">
        <FiAward className="mr-2 text-yellow-500" />
        인기 맛집 랭킹
      </h1>
      <p className="text-gray-600 mb-6">
        사용자들이 가장 많이 원픽으로 선택한 맛집 순위입니다.
      </p>
      
      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={clearError}
          className="mb-6"
        />
      )}
      
      {/* 로딩 스피너 */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* 장소 목록 */}
          {displayPlaces.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {displayPlaces.map((place, index) => (
                <li
                  key={place.id}
                  onClick={() => navigateToPlace(place.id)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center p-4">
                    {/* 순위 */}
                    <div className="flex-shrink-0 w-10 text-center">
                      {index < 3 ? (
                        <span className={`text-xl font-bold ${medalColors[index]}`}>
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-gray-500 font-medium">
                          {index + 1}
                        </span>
                      )}
                    </div>
                    
                    {/* 장소 정보 */}
                    <div className="ml-4 flex-1">
                      <div className="font-medium">{place.name}</div>
                      <div className="text-sm text-gray-500 flex items-center mt-1">
                        <FiMapPin className="mr-1" size={14} />
                        <span>{place.address}</span>
                      </div>
                    </div>
                    
                    {/* 리뷰 수 */}
                    <div className="flex-shrink-0 ml-4 flex items-center text-gray-500">
                      <FiUsers className="mr-1" />
                      <span>{place.reviewCount || 0}</span>
                    </div>
                    
                    {/* 화살표 */}
                    <FiChevronRight className="flex-shrink-0 ml-4 text-gray-400" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-12 text-center text-gray-500">
              <p>아직 등록된 맛집이 없습니다.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}