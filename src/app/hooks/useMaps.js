// src/hooks/useMap.js
import { useEffect, useRef, useCallback, useState } from 'react';
import useMapStore from '@app/store/mapStore';
import { initMap, createMarker, initMarkerClusterer, createInfoWindow } from '@app/lib/maps';

/**
 * 지도 관련 기능을 제공하는 커스텀 훅
 * @param {Object} options - 지도 초기화 옵션
 * @param {boolean} options.autoLoadPlaces - 지도 초기화 시 장소를 자동으로 로드할지 여부 (기본값: true)
 * @param {boolean} options.useMarkerClustering - 마커 클러스터링을 사용할지 여부 (기본값: true)
 * @param {boolean} options.loadSavedPosition - 저장된 위치를 로드할지 여부 (기본값: true)
 * @returns {Object} 지도 관련 상태 및 함수
 */
const useMap = (options = {}) => {
  const {
    autoLoadPlaces = true,
    useMarkerClustering = true,
    loadSavedPosition = true,
  } = options;

  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [mapInitialized, setMapInitialized] = useState(false);

  // mapStore에서 필요한 상태와 함수 가져오기
  const {
    map,
    center,
    zoom,
    places,
    selectedPlace,
    isLoading,
    error,
    setMap,
    setMapPosition,
    moveToCurrentLocation,
    loadPlaces,
    moveToPlace,
    selectPlace,
    clearSelectedPlace,
    clearMarkers,
    searchPlaces: searchPlacesFromStore,
    getPlaceDetails: getPlaceDetailsFromStore,
    setMarkers,
    setMarkerClusterer,
    clearError
  } = useMapStore();

  // 지도 초기화
  const initializeMap = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      // 저장된 위치 로드
      if (loadSavedPosition) {
        useMapStore.getState().loadSavedPosition();
      }

      // 지도 생성
      const newMap = await initMap(mapRef, {
        center,
        zoom,
      });

      if (newMap) {
        setMap(newMap);
        setMapInitialized(true);
      }
    } catch (error) {
      console.error('지도 초기화 오류:', error);
    }
  }, [center, zoom, setMap, loadSavedPosition]);

  // 지도 마커 생성 및 표시
  const createMarkers = useCallback((mapInstance, placesData) => {
    if (!mapInstance || !placesData || placesData.length === 0) return [];

    // 기존 마커 제거
    clearMarkers();
    
    // 새 마커 생성
    const newMarkers = placesData.map(place => {
      if (!place.location) return null;

      const marker = createMarker(mapInstance, place.location, {
        title: place.name,
      });

      // 마커 클릭 이벤트
      if (marker) {
        marker.addListener('click', () => {
          selectPlace(place);
          
          // 정보창 생성 및 표시
          const infoWindow = createInfoWindow(
            `<div class="font-bold">${place.name}</div>
             <div class="text-sm">${place.address || ''}</div>
             <div class="text-sm mt-1">리뷰: ${place.reviewCount || 0}개</div>`
          );
          
          infoWindow.open(mapInstance, marker);
        });
      }

      return marker;
    }).filter(Boolean);

    // 마커 저장
    markersRef.current = newMarkers;
    setMarkers(newMarkers);

    // 마커 클러스터링 초기화
    if (useMarkerClustering && newMarkers.length > 0) {
      initMarkerClusterer(mapInstance, newMarkers)
        .then(clusterer => {
          if (clusterer) {
            setMarkerClusterer(clusterer);
          }
        })
        .catch(error => {
          console.error('마커 클러스터링 오류:', error);
        });
    }

    return newMarkers;
  }, [clearMarkers, selectPlace, setMarkers, setMarkerClusterer, useMarkerClustering]);

  // 장소 로드 및 마커 표시
  const loadPlacesAndCreateMarkers = useCallback(async () => {
    if (!map) return;

    try {
      const placesData = await loadPlaces();
      createMarkers(map, placesData);
    } catch (error) {
      console.error('장소 로드 및 마커 생성 오류:', error);
    }
  }, [map, loadPlaces, createMarkers]);

  // 장소 검색
  const searchPlaces = useCallback(async (query) => {
    const results = await searchPlacesFromStore(query);
    return results;
  }, [searchPlacesFromStore]);

  // 장소 상세 정보 가져오기
  const getPlaceDetails = useCallback(async (placeId) => {
    const placeDetails = await getPlaceDetailsFromStore(placeId);
    return placeDetails;
  }, [getPlaceDetailsFromStore]);

  // 지도 초기화 및 장소 로드
  useEffect(() => {
    if (!mapInitialized) {
      initializeMap();
    }
  }, [initializeMap, mapInitialized]);

  // 지도가 초기화된 후 장소 로드
  useEffect(() => {
    if (mapInitialized && map && autoLoadPlaces) {
      loadPlacesAndCreateMarkers();
    }
  }, [mapInitialized, map, autoLoadPlaces, loadPlacesAndCreateMarkers]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (markersRef.current.length > 0) {
        markersRef.current.forEach(marker => {
          if (marker) marker.setMap(null);
        });
      }
    };
  }, []);

  return {
    mapRef,
    map,
    center,
    zoom,
    places,
    selectedPlace,
    isLoading,
    error,
    setMapPosition,
    moveToCurrentLocation,
    moveToPlace,
    selectPlace,
    clearSelectedPlace,
    searchPlaces,
    getPlaceDetails,
    loadPlaces: loadPlacesAndCreateMarkers,
    clearMarkers,
    clearError,
    createMarkers
  };
};

export default useMap;