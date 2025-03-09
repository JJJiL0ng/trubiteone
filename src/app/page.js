'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Map from '@app/components/featureComponents/mapComponents/Map';
import { FiMapPin, FiPlus, FiMinus } from 'react-icons/fi';

export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [key, setKey] = useState(0); // 지도 컴포넌트 강제 리렌더링을 위한 키
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(15); // 지도 줌 레벨 상태 추가
  const [viewportHeight, setViewportHeight] = useState('100vh');

  // URL 파라미터에서 검색어 가져오기
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  // 뷰포트 높이 계산 및 설정
  useEffect(() => {
    // 초기 뷰포트 높이 설정
    updateViewportHeight();
    
    // 리사이즈 이벤트 리스너 추가
    window.addEventListener('resize', updateViewportHeight);
    
    // 모바일 브라우저에서 주소창이 나타나거나 사라질 때 높이 업데이트
    window.addEventListener('orientationchange', updateViewportHeight);
    
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  // 뷰포트 높이 업데이트 함수
  const updateViewportHeight = () => {
    // 실제 화면 높이 계산 (주소창 제외)
    const vh = window.innerHeight;
    setViewportHeight(`${vh}px`);
    
    // CSS 변수로 실제 뷰포트 높이 설정 (CSS에서 사용 가능)
    document.documentElement.style.setProperty('--vh', `${vh * 0.01}px`);
  };

  // 컴포넌트 마운트 시 지도 리렌더링 강제
  useEffect(() => {
    // 페이지 로드 시 지도 컴포넌트 강제 리렌더링
    setKey(prevKey => prevKey + 1);
    
    // 페이지 가시성 변경 감지
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('페이지가 다시 보이게 됨, 지도 리렌더링');
        setKey(prevKey => prevKey + 1);
        // 화면이 다시 보일 때 뷰포트 높이 재계산
        updateViewportHeight();
      }
    };
    
    // 검색 이벤트 리스너 추가
    const handleSearch = (event) => {
      setSearchQuery(event.detail.query);
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('map:search', handleSearch);
    
    // 스크롤 방지
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('map:search', handleSearch);
      
      // 컴포넌트 언마운트 시 스크롤 복원
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
    };
  }, []);

  // 장소 선택 핸들러
  const handlePlaceSelect = (place) => {
    if (place && place.id) {
      console.log('선택된 장소:', place);
      setSelectedPlace(place);
    }
  };

  // 장소 상세 페이지로 이동
  const navigateToPlace = (placeId) => {
    if (placeId) {
      router.push(`/reviews/${placeId}`);
    }
  };

  // 줌 인/아웃 핸들러
  const handleZoomIn = () => {
    setMapZoom(prev => Math.min(prev + 1, 20)); // 최대 줌 레벨 제한
  };

  const handleZoomOut = () => {
    setMapZoom(prev => Math.max(prev - 1, 10)); // 최소 줌 레벨 제한
  };

  return (
    <div 
      className="flex flex-col fixed inset-0 overflow-hidden"
      style={{ 
        height: viewportHeight,
        top: 'var(--header-height, 64px)',
        paddingTop: 'var(--search-height, 56px)'
      }}
    >
      <div className="flex-1 relative w-full h-full">
        {/* 지도 컴포넌트 - key를 사용하여 강제 리렌더링 */}
        <Map
          key={key}
          showControls={false} // 기본 컨트롤 비활성화
          showSearch={false} // 기본 검색창 비활성화
          enableClustering={true}
          onPlaceSelect={handlePlaceSelect}
          className="w-full h-full absolute inset-0"
          useAutocomplete={false}
          searchQuery={searchQuery} // 검색어 전달
          zoom={mapZoom} // 줌 레벨 전달
        />

        {/* 현재 위치 버튼 - 왼쪽 하단에 배치 */}
        <button 
          className="absolute left-4 bottom-24 z-10 bg-white rounded-full p-3 shadow-md hover:bg-gray-50 transition-colors"
          onClick={() => {
            // 현재 위치로 이동하는 로직
            console.log('현재 위치로 이동');
            // 현재 위치 이벤트 발생
            const locationEvent = new CustomEvent('map:currentLocation');
            window.dispatchEvent(locationEvent);
          }}
          aria-label="현재 위치로 이동"
        >
          <FiMapPin size={24} className="text-blue-600" />
        </button>

        {/* 줌 컨트롤 - 오른쪽 하단에 배치 */}
        <div className="absolute right-4 bottom-24 z-10 bg-white rounded-lg shadow-md flex flex-col">
          <button 
            className="p-2 hover:bg-gray-50 transition-colors border-b border-gray-200"
            onClick={handleZoomIn}
            aria-label="확대"
          >
            <FiPlus size={20} className="text-gray-700" />
          </button>
          <button 
            className="p-2 hover:bg-gray-50 transition-colors"
            onClick={handleZoomOut}
            aria-label="축소"
          >
            <FiMinus size={20} className="text-gray-700" />
          </button>
        </div>

        {/* 선택된 장소가 있을 때 하단 정보 표시 */}
        {selectedPlace && (
          <div className="absolute bottom-0 left-0 right-0 bg-white shadow-lg rounded-t-xl p-4 z-20 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-lg">{selectedPlace.name}</h3>
                <p className="text-gray-600 text-sm mt-1">{selectedPlace.address}</p>
              </div>
              <button 
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                onClick={() => navigateToPlace(selectedPlace.id)}
              >
                상세보기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}