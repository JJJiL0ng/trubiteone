// src/app/page.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Map from '@app/components/featureComponents/mapComponents/Map';
import useMap from '@app/hooks/useMaps';
import Spinner from '@app/components/ui/Spinner';
import ErrorMessage from '@app/components/ui/ErrorMessage';

export default function HomePage() {
  const router = useRouter();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const { mapRef, map, isLoading, error, clearError } = useMap({
    autoLoadPlaces: false, // 먼저 지도만 로드
    loadSavedPosition: true // 저장된 위치 로드 확인
  });

  // 지도 로드 상태 확인 및 디버깅
  useEffect(() => {
    if (map) {
      console.log('지도가 성공적으로 로드되었습니다.', map);
      setIsMapLoaded(true);
    } else {
      console.log('지도 객체가 아직 로드되지 않았습니다.');
    }
  }, [map]);

  // 장소 선택 핸들러
  const handlePlaceSelect = (place) => {
    if (place && place.id) {
      console.log('선택된 장소:', place);
      // 이 부분에서 추가 로직을 구현할 수 있습니다.
    }
  };

  // 장소 상세 페이지로 이동
  const navigateToPlace = (place) => {
    if (place && place.id) {
      router.push(`/reviews/${place.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative min-h-[calc(100vh-64px)]">
        {/* 로딩 스피너 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
            <div className="text-center">
              <Spinner size="lg" className="mb-4" />
              <p>지도를 불러오는 중...</p>
            </div>
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <ErrorMessage
            message={error}
            onClose={clearError}
            className="absolute top-4 left-0 right-0 mx-auto w-max z-20"
          />
        )}

        {/* 지도 컴포넌트 */}
        <Map
          showControls={true}
          showSearch={true}
          enableClustering={true}
          onPlaceSelect={handlePlaceSelect}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}