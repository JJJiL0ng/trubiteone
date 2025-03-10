// src/components/featureComponents/mapComponents/Marker.js
'use client';

import { useEffect, useRef } from 'react';
import { createMarker } from '@app/lib/maps';

/**
 * 구글 맵 마커 컴포넌트
 * 지도 위에 마커를 표시하는 컴포넌트입니다.
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.map - 구글 맵 인스턴스
 * @param {Object} props.position - 마커 위치 (lat, lng)
 * @param {string} props.title - 마커 타이틀 (호버 시 표시)
 * @param {string} props.icon - 마커 아이콘 URL
 * @param {boolean} props.animation - 마커 애니메이션 (DROP, BOUNCE)
 * @param {Function} props.onClick - 마커 클릭 이벤트 핸들러
 */
const Marker = ({
  map,
  position,
  title,
  icon,
  animation,
  onClick
}) => {
  const markerRef = useRef(null);

  // 마커 생성 및 설정
  useEffect(() => {
    if (!map || !position) return;

    // 마커 옵션
    const options = {
      title,
      icon,
      animation
    };

    // 마커 생성
    const marker = createMarker(map, position, options);
    markerRef.current = marker;

    // 클릭 이벤트 핸들러 등록

    if (marker && onClick) {
      marker.addListener('click', () => {
        // 먼저 마커 위치로 지도 중심 이동
        map.panTo(marker.getPosition());
        
        // 마커가 화면의 상단 1/4 지점에 오도록 조정
        // 모바일에서 바텀시트가 마커를 가리지 않도록 더 위쪽으로 배치
        // 구글맵/네이버맵과 유사한 위치로 조정
        const mapHeight = map.getDiv().offsetHeight;
        const offsetY = Math.floor(mapHeight * 0.045); // 화면 높이의 45% 정도 아래로 이동하여 마커가 상단에 오도록 함
        
        map.panBy(0, offsetY);

        // 원래 onClick 콜백 호출
        onClick({
          id: marker.id,
          position: marker.getPosition().toJSON(),
          title: marker.getTitle()
        });
      });
    }

    // 컴포넌트 언마운트 시 마커 제거
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
    };
  }, [map, position, title, icon, animation, onClick]);

  // 위치 변경 시 마커 위치 업데이트
  useEffect(() => {
    if (markerRef.current && position) {
      markerRef.current.setPosition(position);
    }
  }, [position]);

  // 타이틀 변경 시 마커 타이틀 업데이트
  useEffect(() => {
    if (markerRef.current && title) {
      markerRef.current.setTitle(title);
    }
  }, [title]);

  // 아이콘 변경 시 마커 아이콘 업데이트
  useEffect(() => {
    if (markerRef.current && icon) {
      markerRef.current.setIcon(icon);
    }
  }, [icon]);

  // 애니메이션 변경 시 마커 애니메이션 업데이트
  useEffect(() => {
    if (markerRef.current && animation) {
      markerRef.current.setAnimation(animation);
    }
  }, [animation]);

  // 실제 렌더링되는 DOM 요소는 없음 (구글 지도 API가 마커를 관리)
  return null;
};

export default Marker;