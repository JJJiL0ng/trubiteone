// src/hooks/useMaps.js
import { useEffect, useRef, useCallback, useState } from 'react';
import useMapStore from '@app/store/mapStore';
import { 
  initMap, 
  createMarker, 
  initMarkerClusterer, 
  createInfoWindow, 
  isMapsApiLoaded 
} from '@app/lib/maps';

/**
 * 지도 관련 기능을 제공하는 커스텀 훅
 * @param {Object} options - 지도 초기화 옵션
 * @param {React.RefObject} options.mapRef - 지도를 렌더링할 DOM 요소의 ref
 * @param {boolean} options.autoLoadPlaces - 지도 초기화 시 장소를 자동으로 로드할지 여부 (기본값: true)
 * @param {boolean} options.useMarkerClustering - 마커 클러스터링을 사용할지 여부 (기본값: true)
 * @param {boolean} options.loadSavedPosition - 저장된 위치를 로드할지 여부 (기본값: true)
 * @param {Object} options.mapOptions - 지도 초기화 추가 옵션
 * @returns {Object} 지도 관련 상태 및 함수
 */
const useMap = (options = {}) => {
  const {
    mapRef,
    autoLoadPlaces = true,
    useMarkerClustering = true,
    loadSavedPosition = true,
    mapOptions = {}
  } = options;

  // 로컬 상태
  const markersRef = useRef([]);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapInitAttempts, setMapInitAttempts] = useState(0);
  const [isInitializing, setIsInitializing] = useState(false);
  const maxInitAttempts = 5; // 최대 시도 횟수 증가

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

  // Google Maps API 로드 상태 확인
  const checkMapsApiLoaded = useCallback(() => {
    const isLoaded = isMapsApiLoaded();
    console.log('Google Maps API 로드 상태:', isLoaded);
    return isLoaded;
  }, []);

  // 지도 초기화
  const initializeMap = useCallback(async () => {
    if (!mapRef || !mapRef.current) {
      console.error('mapRef가 유효하지 않습니다.');
      return;
    }

    // 이미 초기화 중이거나 초기화된 경우 스킵
    if (map || isInitializing) {
      console.log('지도가 이미 초기화되어 있거나 초기화 중입니다.');
      return;
    }

    try {
      console.log('지도 초기화 시작...');
      setIsInitializing(true);
      
      // API 로드 확인
      if (!checkMapsApiLoaded()) {
        console.log('Google Maps API가 아직 로드되지 않았습니다. 나중에 다시 시도합니다.');
        
        // 일정 시간 후 재시도 (최대 시도 횟수 제한)
        if (mapInitAttempts < maxInitAttempts) {
          setTimeout(() => {
            setMapInitAttempts(prev => prev + 1);
          }, 1000);
        } else {
          console.error('최대 초기화 시도 횟수 초과');
        }
        setIsInitializing(false);
        return;
      }
      
      // 저장된 위치 로드
      if (loadSavedPosition) {
        useMapStore.getState().loadSavedPosition();
      }

      // 컨테이너 크기 확인
      const containerWidth = mapRef.current.offsetWidth;
      const containerHeight = mapRef.current.offsetHeight;
      
      if (containerWidth === 0 || containerHeight === 0) {
        console.warn('지도 컨테이너 크기가 0입니다:', { width: containerWidth, height: containerHeight });
        
        // 컨테이너 크기가 0인 경우 재시도
        if (mapInitAttempts < maxInitAttempts) {
          setTimeout(() => {
            setMapInitAttempts(prev => prev + 1);
          }, 500);
        }
        setIsInitializing(false);
        return;
      }

      // 지도 생성
      const newMap = await initMap(mapRef, {
        center,
        zoom,
        ...mapOptions
      });

      if (newMap) {
        console.log('지도 초기화 성공');
        setMap(newMap);
        setMapInitialized(true);
        
        // 지도 이동 감지 이벤트 등록
        newMap.addListener('idle', () => {
          const newCenter = newMap.getCenter();
          const newZoom = newMap.getZoom();
          
          if (newCenter && newZoom) {
            setMapPosition({
              center: { lat: newCenter.lat(), lng: newCenter.lng() },
              zoom: newZoom
            });
          }
        });
        
        // 지도 리사이즈 트리거
        window.google.maps.event.trigger(newMap, 'resize');
      } else {
        console.error('지도 인스턴스가 생성되지 않았습니다.');
      }
    } catch (error) {
      console.error('지도 초기화 오류:', error);
    } finally {
      setIsInitializing(false);
    }
  }, [
    mapRef, map, center, zoom, setMap, loadSavedPosition, 
    checkMapsApiLoaded, mapInitAttempts, isInitializing, mapOptions
  ]);

  // 지도 초기화 및 재시도 로직
  useEffect(() => {
    // API가 로드되지 않았고 최대 시도 횟수에 도달하지 않았을 때만 재시도
    if (mapInitAttempts > 0 && mapInitAttempts < maxInitAttempts && !mapInitialized && !isInitializing) {
      console.log(`지도 초기화 재시도... (${mapInitAttempts}/${maxInitAttempts})`);
      initializeMap();
    }
  }, [mapInitAttempts, mapInitialized, isInitializing, initializeMap, maxInitAttempts]);

  // 마커 생성 및 표시
  const createMarkers = useCallback((mapInstance, placesData) => {
    if (!mapInstance || !placesData || placesData.length === 0) return [];

    // 기존 마커 제거
    clearMarkers();
    
    console.log(`${placesData.length}개의 장소에 대한 마커 생성 중...`);
    
    // 새 마커 생성
    const newMarkers = placesData.map(place => {
      if (!place.location) {
        console.warn('위치 정보가 없는 장소:', place);
        return null;
      }

      const marker = createMarker(mapInstance, place.location, {
        title: place.name,
      });

      // 마커 클릭 이벤트
      if (marker) {
        marker.addListener('click', () => {
          console.log('마커 클릭:', place);
          selectPlace(place);
          
          // 정보창 생성 및 표시
          const infoWindow = createInfoWindow(
            `<div class="font-bold">${place.name}</div>
             <div class="text-sm">${place.address || ''}</div>
             <div class="text-sm mt-1">리뷰: ${place.reviewCount || 0}개</div>`
          );
          
          infoWindow.open(mapInstance, marker);
        });
      } else {
        console.warn('마커 생성 실패:', place);
      }

      return marker;
    }).filter(Boolean);

    console.log(`${newMarkers.length}개의 마커가 생성됨`);

    // 마커 저장
    markersRef.current = newMarkers;
    setMarkers(newMarkers);

    // 마커 클러스터링 초기화
    if (useMarkerClustering && newMarkers.length > 0) {
      console.log('마커 클러스터링 초기화 중...');
      initMarkerClusterer(mapInstance, newMarkers)
        .then(clusterer => {
          if (clusterer) {
            console.log('마커 클러스터링 성공');
            setMarkerClusterer(clusterer);
          } else {
            console.warn('마커 클러스터러가 생성되지 않았습니다.');
          }
        })
        .catch(error => {
          console.error('마커 클러스터링 오류:', error);
        });
    } else {
      console.log('마커 클러스터링 사용하지 않음');
    }

    return newMarkers;
  }, [clearMarkers, selectPlace, setMarkers, setMarkerClusterer, useMarkerClustering]);

  // 장소 로드 및 마커 표시
  const loadPlacesAndCreateMarkers = useCallback(async () => {
    if (!map) {
      console.warn('지도가 초기화되지 않았습니다. 장소를 로드할 수 없습니다.');
      return;
    }

    try {
      console.log('장소 로드 시작...');
      
      const placesData = await loadPlaces();
      console.log(`${placesData.length}개의 장소 로드됨`);
      
      createMarkers(map, placesData);
    } catch (error) {
      console.error('장소 로드 및 마커 생성 오류:', error);
    }
  }, [map, loadPlaces, createMarkers]);

  // 장소 검색
  const searchPlaces = useCallback(async (query) => {
    if (!query) return [];
    
    try {
      console.log('장소 검색 중:', query);
      const results = await searchPlacesFromStore(query);
      console.log(`${results.length}개의 검색 결과 찾음`);
      return results;
    } catch (error) {
      console.error('장소 검색 오류:', error);
      return [];
    }
  }, [searchPlacesFromStore]);

  // 장소 상세 정보 가져오기
  const getPlaceDetails = useCallback(async (placeId) => {
    if (!placeId) return null;
    
    try {
      console.log('장소 상세 정보 가져오는 중:', placeId);
      const placeDetails = await getPlaceDetailsFromStore(placeId);
      return placeDetails;
    } catch (error) {
      console.error('장소 상세 정보 가져오기 오류:', error);
      return null;
    }
  }, [getPlaceDetailsFromStore]);

  // 지도 초기화
  useEffect(() => {
    if (!mapInitialized && mapRef && mapRef.current && !isInitializing) {
      console.log('지도 초기화 시도...');
      initializeMap();
    }
  }, [mapInitialized, mapRef, initializeMap, isInitializing]);

  // 지도 초기화 첫 시도
  useEffect(() => {
    // 컴포넌트 마운트 시 초기화 시도
    if (mapRef && mapRef.current && !map && !isInitializing && mapInitAttempts === 0) {
      console.log('지도 초기화 첫 시도...');
      setMapInitAttempts(1);
    }
  }, [mapRef, map, isInitializing, mapInitAttempts]);

  // window resize 이벤트 처리
  useEffect(() => {
    const handleResize = () => {
      if (map && mapRef && mapRef.current) {
        console.log('윈도우 리사이즈 감지, 지도 크기 재조정');
        window.google.maps.event.trigger(map, 'resize');
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [map, mapRef]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      console.log('useMap 훅 정리 중...');
      
      // map 인스턴스에서 모든 이벤트 리스너 제거
      if (map) {
        window.google.maps.event.clearInstanceListeners(map);
      }
      
      // 개별 마커의 이벤트 리스너 및 마커 제거
      if (markersRef.current.length > 0) {
        console.log(`${markersRef.current.length}개의 마커 제거`);
        markersRef.current.forEach(marker => {
          if (marker) {
            window.google.maps.event.clearInstanceListeners(marker);
            marker.setMap(null);
          }
        });
        markersRef.current = [];
      }
    };
  }, [map]);

  // 자동으로 장소 로드
  useEffect(() => {
    if (mapInitialized && map && autoLoadPlaces) {
      console.log('지도 초기화 후 자동으로 장소 로드');
      loadPlacesAndCreateMarkers();
    }
  }, [mapInitialized, map, autoLoadPlaces, loadPlacesAndCreateMarkers]);

  return {
    map,
    center,
    zoom,
    places,
    selectedPlace,
    isLoading: isLoading || isInitializing,
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
    createMarkers,
    mapInitialized
  };
};

export default useMap;