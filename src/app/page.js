'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Map from '@app/components/featureComponents/mapComponents/Map';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const [selectedPlace, setSelectedPlace] = useState(null);

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
        {/* 지도 컴포넌트 */}
        <Map
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