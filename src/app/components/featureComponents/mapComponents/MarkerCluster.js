// src/components/featureComponents/mapComponents/MarkerCluster.js
'use client';

import { useEffect, useRef } from 'react';
import { initMarkerClusterer } from '@app/lib/maps';

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
        // 클러스터러 생성 (옵션 전달 방식 수정)
        const clusterer = await initMarkerClusterer(map, markers);
        clusterRef.current = clusterer;
      } catch (error) {
        console.error('마커 클러스터링 초기화 오류:', error);
      }
    };

    initClusterer();

    // 컴포넌트 언마운트 시 클러스터러 제거
    return () => {
      if (clusterRef.current) {
        // 최신 API에서는 clearMarkers 대신 setMap(null)을 사용
        clusterRef.current.setMap(null);
        clusterRef.current = null;
      }
    };
  }, [map, markers, gridSize, maxZoom, minimumClusterSize]);

  // 마커 업데이트 시 클러스터러 갱신 (최신 API 방식)
  useEffect(() => {
    if (clusterRef.current && markers) {
      // 최신 API에서는 addMarkers/clearMarkers 대신 setMap(null)과 새 인스턴스 생성
      clusterRef.current.setMap(null);
      initMarkerClusterer(map, markers).then(newClusterer => {
        clusterRef.current = newClusterer;
      });
    }
  }, [markers, map]);

  return null;
};

export default MarkerCluster;