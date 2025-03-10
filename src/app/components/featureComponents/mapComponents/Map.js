// src/components/featureComponents/mapComponents/Map.js
'use client';

import { useEffect, useState, useRef } from 'react';
import { FiNavigation, FiSearch, FiPlus } from 'react-icons/fi';
import useMap from '@app/hooks/useMaps';
import useAuth from '@app/hooks/useAuth';
import Spinner from '@app/components/ui/Spinner';
import ErrorMessage from '@app/components/ui/ErrorMessage';
import PlaceSearch from '@app/components/featureComponents/mapComponents/PlaceSearch';
import Script from 'next/script';
import useMapStore from '@app/store/mapStore';
import { searchPlaceByQuery } from '@app/lib/maps';
// 바텀시트 관련 컴포넌트 임포트
import ReviewBottomSheet from '@app/components/featureComponents/reviewComponents/ReviewBottomSheet';

/**
 * 구글 맵 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {boolean} props.showControls - 컨트롤 표시 여부 (기본값: true)
 * @param {boolean} props.showSearch - 검색 기능 표시 여부 (기본값: true)
 * @param {boolean} props.enableClustering - 마커 클러스터링 사용 여부 (기본값: true)
 * @param {Function} props.onPlaceSelect - 장소 선택 시 콜백 함수
 * @param {string} props.className - 추가 CSS 클래스
 * @param {boolean} props.useAutocomplete - 자동완성 기능 사용 여부 (기본값: false)
 */
const Map = ({
  showControls = true,
  showSearch = true,
  enableClustering = true,
  onPlaceSelect,
  className = '',
  useAutocomplete = false
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [mapsLoaded, setMapsLoaded] = useState(false);
  const [mapRenderAttempt, setMapRenderAttempt] = useState(0);
  const [forceRender, setForceRender] = useState(0);
  // 바텀시트 상태 추가
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [selectedPlaceForBottomSheet, setSelectedPlaceForBottomSheet] = useState(null);
  
  const { isAuthenticated } = useAuth();
  const mapContainerRef = useRef(null);
  const resetMapState = useMapStore(state => state.resetMapState);

  // 컴포넌트 마운트 시 지도 상태 초기화
  useEffect(() => {
    console.log('Map 컴포넌트 마운트, 지도 상태 초기화');
    resetMapState();
    
    // 이미 Google Maps API가 로드되어 있는지 확인
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      console.log('Google Maps API가 이미 로드되어 있습니다.');
      setMapsLoaded(true);
    }
    
    return () => {
      console.log('Map 컴포넌트 언마운트');
    };
  }, [resetMapState]);

  // 지도 훅 초기화
  const {
    map,
    isLoading,
    error,
    moveToCurrentLocation,
    moveToPlace,
    selectedPlace,
    clearError,
    loadPlaces,
    mapInitialized
  } = useMap({
    mapRef: mapContainerRef,
    autoLoadPlaces: mapsLoaded, // Google Maps API가 로드된 후에만 장소 로드
    useMarkerClustering: enableClustering,
    loadSavedPosition: true,
    mapOptions: {
      mapTypeId: 'roadmap', 
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      zoomControl: false, // 기본 줌 컨트롤 비활성화
      gestureHandling: 'greedy' // 모바일에서 한 손가락으로도 지도 이동 가능
    }
  });

  // 현재 위치 이벤트 리스너 추가
  useEffect(() => {
    const handleCurrentLocation = () => {
      console.log('현재 위치 이벤트 감지됨');
      if (moveToCurrentLocation) {
        moveToCurrentLocation();
      }
    };
    
    window.addEventListener('map:currentLocation', handleCurrentLocation);
    
    return () => {
      window.removeEventListener('map:currentLocation', handleCurrentLocation);
    };
  }, [moveToCurrentLocation]);

  // Google Maps API 로드 완료 핸들러
  const handleMapsLoaded = () => {
    console.log('Google Maps API 로드 완료');
    setMapsLoaded(true);
    
    // 전역 이벤트 발생
    if (typeof window !== 'undefined') {
      window.googleMapsLoaded = true;
      window.dispatchEvent(new Event('google-maps-loaded'));
    }
    
    // 강제 리렌더링
    setForceRender(prev => prev + 1);
  };

  // 지도 렌더링 재시도 로직
  useEffect(() => {
    // 지도가 로드되지 않았고 컨테이너가 존재하는 경우 재시도
    if (mapsLoaded && mapContainerRef.current && !map) {
      const timer = setTimeout(() => {
        console.log(`지도 렌더링 재시도... (${mapRenderAttempt + 1})`);
        setMapRenderAttempt(prev => prev + 1);
        setForceRender(prev => prev + 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [mapsLoaded, map, mapRenderAttempt]);

  // 지도가 초기화되었을 때 장소 로드
  useEffect(() => {
    if (map && mapInitialized) {
      console.log('지도가 초기화되었습니다. 장소 로드를 시작합니다.');
      
      // 지도 타입 컨트롤 비활성화
      map.setOptions({
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false, // 기본 줌 컨트롤 비활성화
        gestureHandling: 'greedy' // 모바일에서 한 손가락으로도 지도 이동 가능
      });
      
      // 지도 리사이즈 트리거 - 지도가 제대로 표시되지 않는 문제 해결
      if (window.google && window.google.maps) {
        window.google.maps.event.trigger(map, 'resize');
      }
      
      // 약간의 지연 후 장소 로드 (지도 렌더링이 완료된 후)
      setTimeout(() => {
        loadPlaces();
      }, 500);
    }
  }, [map, mapInitialized, loadPlaces, forceRender]);

  // 선택된 장소가 변경되면 콜백 호출 및 바텀시트 표시
  useEffect(() => {
    if (selectedPlace) {
      // 기존 콜백 호출
      if (onPlaceSelect) {
        onPlaceSelect(selectedPlace);
      }
      
      // 바텀시트용 상태 설정
      setSelectedPlaceForBottomSheet(selectedPlace);
      setBottomSheetVisible(true);
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
      
      // 바텀시트 표시
      setSelectedPlaceForBottomSheet(place);
      setBottomSheetVisible(true);
      
      // 검색창 닫기
      setSearchVisible(false);
    }
  };

  // 바텀시트 닫기 핸들러
  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  // 원픽 등록 핸들러
  const handleAddFavorite = () => {
    if (selectedPlaceForBottomSheet) {
      window.location.href = `/addMyFavorite?placeId=${selectedPlaceForBottomSheet.id}`;
    } else {
      window.location.href = '/addMyFavorite';
    }
  };

  // 페이지 가시성 변경 감지
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('페이지가 다시 보이게 됨, 지도 리렌더링');
        setForceRender(prev => prev + 1);
        
        // 지도가 이미 초기화된 경우 리사이즈 트리거
        if (map) {
          setTimeout(() => {
            window.google.maps.event.trigger(map, 'resize');
          }, 100);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [map]);

  // 검색 이벤트 리스너 추가
  useEffect(() => {
    const handleSearch = async (event) => {
      console.log('검색 이벤트 감지됨:', event.detail.query);
      
      if (event.detail.query && event.detail.action === 'moveToLocation') {
        try {
          // 검색어로 장소 검색
          const place = await searchPlaceByQuery(event.detail.query);
          
          if (place && place.location) {
            console.log('검색된 장소로 이동:', place);
            
            // 직접 지도 이동 처리
            if (map) {
              console.log('지도 이동 시도:', place.location);
              map.setCenter(place.location);
              map.setZoom(15); // 적절한 줌 레벨 설정
              
              // 마커 생성 (선택 사항)
              const marker = new window.google.maps.Marker({
                position: place.location,
                map: map,
                title: place.name
              });
              
              // 3초 후 마커 제거 (선택 사항)
              setTimeout(() => {
                marker.setMap(null);
              }, 3000);
            } else {
              console.error('지도 인스턴스가 없습니다.');
            }
            
            // 기존 moveToPlace 함수도 호출
            moveToPlace(place);
          }
        } catch (error) {
          console.error('검색 처리 오류:', error);
        }
      }
    };
    
    window.addEventListener('map:search', handleSearch);
    
    return () => {
      window.removeEventListener('map:search', handleSearch);
    };
  }, [moveToPlace, map]);

  return (
    <div className={`relative w-full h-screen ${className}`}>
      {/* Google Maps API 스크립트 - 이미 로드되지 않은 경우에만 로드 */}
      {!mapsLoaded && (
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
          strategy="afterInteractive"
          onLoad={handleMapsLoaded}
        />
      )}
      
      {/* MarkerClusterer 라이브러리 */}
      {mapsLoaded && (
        <Script
          src="https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js"
          strategy="afterInteractive"
        />
      )}

      {/* 지도 컨테이너 */}
      <div
        ref={mapContainerRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '500px' }}
        aria-label="Google Map"
      />

      {/* 로딩 인디케이터 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-10">
          <Spinner size="lg" />
          <p className="ml-2 font-medium">지도를 불러오는 중...</p>
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
      {showControls && map && (
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
              onClick={handleAddFavorite}
              className="bg-white p-3 rounded-full shadow-md hover:bg-gray-100 transition-colors"
              aria-label="원픽 맛집 추가"
              title="원픽 맛집 추가"
            >
              <FiPlus className="text-green-600" />
            </button>
          )}
        </div>
      )}

      {/* 줌 컨트롤 버튼 */}
      {map && (
        <div className="absolute right-4 bottom-24 flex flex-col gap-1 z-20">
          <button
            onClick={() => map.setZoom(map.getZoom() + 1)}
            className="bg-white w-10 h-10 flex items-center justify-center rounded-t-md shadow-md hover:bg-gray-100 transition-colors"
            aria-label="확대"
            title="확대"
          >
            <span className="text-xl font-bold">+</span>
          </button>
          <button
            onClick={() => map.setZoom(map.getZoom() - 1)}
            className="bg-white w-10 h-10 flex items-center justify-center rounded-b-md shadow-md hover:bg-gray-100 transition-colors"
            aria-label="축소"
            title="축소"
          >
            <span className="text-xl font-bold">-</span>
          </button>
        </div>
      )}

      {/* 검색 패널 */}
      {showSearch && searchVisible && map && (
        <div className="absolute top-4 left-4 right-16 z-10">
          <PlaceSearch onPlaceSelect={handlePlaceSelect} useAutocomplete={useAutocomplete} />
        </div>
      )}

      {/* 바텀시트 */}
      {bottomSheetVisible && selectedPlaceForBottomSheet && (
        <ReviewBottomSheet
          isOpen={bottomSheetVisible}
          onClose={handleCloseBottomSheet}
          place={selectedPlaceForBottomSheet}
          onAddFavorite={handleAddFavorite}
        />
      )}
    </div>
  );
};

export default Map;