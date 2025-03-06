// src/components/featureComponents/mapComponents/Map.js
'use client';

import { useEffect, useState } from 'react';
import { FiNavigation, FiSearch, FiPlus, FiInfo } from 'react-icons/fi';
import useMap from '@app/hooks/useMaps';
import useAuth from '@app/hooks/useAuth';
import Spinner from '@app/components/ui/Spinner';
import ErrorMessage from '@app/components/ui/ErrorMessage';
import PlaceSearch from '@app/components/featureComponents/mapComponents/PlaceSearch';

/**
 * 구글 맵 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.showControls - 컨트롤 표시 여부 (기본값: true)
 * @param {boolean} props.showSearch - 검색 기능 표시 여부 (기본값: true)
 * @param {boolean} props.enableClustering - 마커 클러스터링 사용 여부 (기본값: true)
 * @param {Function} props.onPlaceSelect - 장소 선택 시 콜백 함수
 * @param {string} props.className - 추가 CSS 클래스
 */
const Map = ({
  showControls = true,
  showSearch = true,
  enableClustering = true,
  onPlaceSelect,
  className = ''
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const { isAuthenticated } = useAuth();

  // 지도 훅 초기화
  const {
    mapRef,
    isLoading,
    error,
    moveToCurrentLocation,
    moveToPlace,
    selectedPlace,
    clearError
  } = useMap({
    autoLoadPlaces: true,
    useMarkerClustering: enableClustering
  });

  // 선택된 장소가 변경되면 콜백 호출
  useEffect(() => {
    if (selectedPlace && onPlaceSelect) {
      onPlaceSelect(selectedPlace);
    }
  }, [selectedPlace, onPlaceSelect]);

  // 검색 토글
  const toggleSearch = () => {
    setSearchVisible(prev => !prev);
  };

  // 장소 선택 핸들러
  const handlePlaceSelect = (place) => {
    if (place) {
      moveToPlace(place);
      
      if (onPlaceSelect) {
        onPlaceSelect(place);
      }
      
      // 검색창 닫기
      setSearchVisible(false);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* 지도 컨테이너 */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        aria-label="Google Map"
      />

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <Spinner size="lg" />
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <ErrorMessage
          message={error}
          onClose={clearError}
          className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20"
        />
      )}

      {/* 컨트롤 버튼 */}
      {showControls && (
        <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
          {/* 현재 위치 버튼 */}
          <button
            onClick={moveToCurrentLocation}
            className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
            aria-label="내 위치로 이동"
            title="내 위치로 이동"
          >
            <FiNavigation className="text-blue-500" />
          </button>

          {/* 검색 버튼 */}
          {showSearch && (
            <button
              onClick={toggleSearch}
              className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="장소 검색"
              title="장소 검색"
            >
              <FiSearch className="text-gray-700" />
            </button>
          )}

          {/* 원픽 맛집 추가 버튼 (로그인 시에만 표시) */}
          {isAuthenticated && (
            <button
              onClick={() => {
                if (selectedPlace) {
                  window.location.href = `/addMyFavorite?placeId=${selectedPlace.id}`;
                } else {
                  window.location.href = '/addMyFavorite';
                }
              }}
              className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="원픽 맛집 추가"
              title="원픽 맛집 추가"
            >
              <FiPlus className="text-green-600" />
            </button>
          )}
        </div>
      )}

      {/* 검색 패널 */}
      {showSearch && searchVisible && (
        <div className="absolute top-4 left-4 right-16 z-10">
          <PlaceSearch onPlaceSelect={handlePlaceSelect} />
        </div>
      )}

      {/* 선택된 장소 정보 */}
      {selectedPlace && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg">{selectedPlace.name}</h3>
              <p className="text-sm text-gray-600">{selectedPlace.address}</p>
              
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => window.location.href = `/reviews/${selectedPlace.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  리뷰 보기
                </button>
                
                {isAuthenticated && (
                  <button
                    onClick={() => window.location.href = `/addMyFavorite?placeId=${selectedPlace.id}`}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                  >
                    원픽 등록
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={() => moveToPlace(null)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="닫기"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;