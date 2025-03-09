'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Map from '@app/components/featureComponents/mapComponents/Map';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [key, setKey] = useState(0); // 지도 컴포넌트 강제 리렌더링을 위한 키

  // 컴포넌트 마운트 시 지도 리렌더링 강제
  useEffect(() => {
    // 페이지 로드 시 지도 컴포넌트 강제 리렌더링
    setKey(prevKey => prevKey + 1);
    
    // 페이지 가시성 변경 감지
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('페이지가 다시 보이게 됨, 지도 리렌더링');
        setKey(prevKey => prevKey + 1);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative min-h-[calc(100vh-64px)]">
        {/* 지도 컴포넌트 - key를 사용하여 강제 리렌더링 */}
        <Map
          key={key}
          showControls={true}
          showSearch={true}
          enableClustering={true}
          onPlaceSelect={handlePlaceSelect}
          className="w-full h-full"
          useAutocomplete={false}
        />
      </div>
    </div>
  );
}