// src/components/featureComponents/mapComponents/MarkerCluster.js  
'use client';

import { useEffect, useRef } from 'react';
import { initMarkerClusterer } from '@app/lib/maps';

/**
 * 마커 클러스터링 컴포넌트
 * 여러 마커를 그룹화하여 지도의 가독성을 높이는 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.map - 구글 맵 인스턴스
 * @param {Array} props.markers - 마커 객체 배열
 * @param {number} props.gridSize - 클러스터 그리드 크기 (기본값: 50)
 * @param {number} props.maxZoom - 클러스터링 최대 줌 레벨 (기본값: 15)
 * @param {number} props.minimumClusterSize - 최소 클러스터 크기 (기본값: 2)
 */
const MarkerCluster = ({
  map,
  markers,
  gridSize = 50,
  maxZoom = 15,
  minimumClusterSize = 2
}) => {
  const clusterRef = useRef(null);

  // 마커 클러스터러 초기화
  useEffect(() => {
    if (!map || !markers || markers.length === 0) return;

    const initClusterer = async () => {
      try {
        // 클러스터러 생성
        const clusterer = await initMarkerClusterer(map, markers, {
          gridSize,
          maxZoom,
          minimumClusterSize
        });
        
        clusterRef.current = clusterer;
      } catch (error) {
        console.error('마커 클러스터링 초기화 오류:', error);
      }
    };

    initClusterer();

    // 컴포넌트 언마운트 시 클러스터러 제거
    return () => {
      if (clusterRef.current) {
        clusterRef.current.clearMarkers();
        clusterRef.current = null;
      }
    };
  }, [map, markers, gridSize, maxZoom, minimumClusterSize]);

  // 마커 업데이트 시 클러스터러 갱신
  useEffect(() => {
    if (clusterRef.current && markers) {
      clusterRef.current.clearMarkers();
      clusterRef.current.addMarkers(markers);
    }
  }, [markers]);

  // 실제 렌더링되는 DOM 요소는 없음 (마커 클러스터러는 구글 지도 위에 직접 렌더링됨)
  return null;
};

export default MarkerCluster;