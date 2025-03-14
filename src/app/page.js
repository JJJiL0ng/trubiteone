'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Map from '@app/components/featureComponents/mapComponents/Map';
import { FiMapPin, FiPlus, FiMinus } from 'react-icons/fi';

// SearchParamsComponent를 별도로 만들어 useSearchParams를 사용
function SearchParamsComponent({ setSearchQuery }) {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams, setSearchQuery]);
  
  return null;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [key, setKey] = useState(0); // 지도 컴포넌트 강제 리렌더링을 위한 키
  const [searchQuery, setSearchQuery] = useState('');
  const [mapZoom, setMapZoom] = useState(15); // 지도 줌 레벨 상태 추가
  const [viewportHeight, setViewportHeight] = useState('100vh');

  // URL 파라미터에서 검색어 가져오기 - Suspense로 감싸기
  // 나머지 코드는 그대로 유지

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
    } else {
      // 선택된 장소가 없거나 유효하지 않은 경우 selectedPlace를 null로 설정
      setSelectedPlace(null);
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
        paddingTop: 'var(--search-height, 56px)',
        paddingBottom: '20px' // 하단에 여백 추가
      }}
    >
      {/* Suspense로 SearchParamsComponent 감싸기 */}
      <Suspense fallback={null}>
        <SearchParamsComponent setSearchQuery={setSearchQuery} />
      </Suspense>
      
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
      </div>
      
      {/* 하단 여백 추가 */}
      <div className="h-6"></div>
    </div>
  );
}