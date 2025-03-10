// src/hooks/useMaps.js
import { useEffect, useRef, useCallback, useState } from 'react';
import useMapStore from '@app/store/mapStore';
import { 
  initMap, 
  createMarker, 
  initMarkerClusterer, 
  isMapsApiLoaded,
  getCurrentLocation,
  searchPlaceByQuery
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
        markerColor: '#4169E1', // 로얄 블루 색상 지정
        customMarker: true,      // 커스텀 마커 사용
        markerText: 'T',         // 마커 내부에 표시할 텍스트
        markerSize: 36,          // 마커 크기 (픽셀)
        markerTextColor: '#FFFFFF', // 텍스트 색상
        markerTextSize: '14px'   // 텍스트 크기
      });

      // 마커 클릭 이벤트
      if (marker) {
        marker.addListener('click', () => {
          console.log('마커 클릭:', place);
          selectPlace(place);
          
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

  // 장소 검색 함수 개선
  const searchPlaces = useCallback(async (query) => {
    if (!query) return [];
    
    try {
      console.log('장소 검색 중:', query);
      
      // 먼저 store의 검색 함수 사용
      const results = await searchPlacesFromStore(query);
      
      if (results.length > 0) {
        console.log(`${results.length}개의 검색 결과 찾음`);
        return results;
      }
      
      // 결과가 없으면 직접 검색 시도
      try {
        const place = await searchPlaceByQuery(query);
        if (place) {
          return [place];
        }
      } catch (searchError) {
        console.warn('직접 장소 검색 실패:', searchError);
      }
      
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

  // 현재 위치로 이동하는 함수를 새로 정의합니다
  const moveToCurrentLocationWithMarker = useCallback(async () => {
    if (!map) {
      console.warn('지도가 초기화되지 않았습니다. 현재 위치로 이동할 수 없습니다.');
      return;
    }

    try {
      console.log('현재 위치 가져오는 중...');
      const position = await getCurrentLocation();
      console.log('현재 위치:', position);
      
      // 지도 이동
      map.setCenter(position);
      map.setZoom(16); // 적절한 줌 레벨로 설정
      
      // 기존 현재 위치 마커 제거
      if (window.currentLocationMarker) {
        window.currentLocationMarker.setMap(null);
      }
      
      // 단순한 빨간 원 마커 생성
      const currentLocationMarker = new window.google.maps.Marker({
        position: position,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: '#FF0000', // 빨간색
          fillOpacity: 1,
          strokeColor: '#FFFFFF', // 흰색 테두리
          strokeWeight: 2,
          scale: 8 // 작은 크기
        },
        title: '현재 위치'
      });
      
      // 전역 변수에 마커 저장 (나중에 제거할 수 있도록)
      window.currentLocationMarker = currentLocationMarker;
      
      // 줌 변경 이벤트 리스너 추가
      const zoomListener = window.google.maps.event.addListener(map, 'zoom_changed', () => {
        const currentZoom = map.getZoom();
        // 줌 레벨이 13 미만이면 마커 숨기기
        if (currentZoom < 13) {
          currentLocationMarker.setVisible(false);
        } else {
          currentLocationMarker.setVisible(true);
        }
      });
      
      // 위치 저장
      setMapPosition({
        center: position,
        zoom: map.getZoom()
      });
      
      return position;
    } catch (error) {
      console.error('현재 위치 가져오기 오류:', error);
      
      // 오류 메시지 표시
      if (error.code === 1) { // PERMISSION_DENIED
        alert('위치 정보 접근 권한이 거부되었습니다. 브라우저 설정에서 위치 정보 접근을 허용해주세요.');
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        alert('현재 위치를 확인할 수 없습니다.');
      } else if (error.code === 3) { // TIMEOUT
        alert('위치 정보 요청 시간이 초과되었습니다.');
      } else {
        alert('위치 정보를 가져오는 중 오류가 발생했습니다.');
      }
      
      return null;
    }
  }, [map, setMapPosition]);

  // 기존 함수 대신 새 함수를 반환합니다
  return {
    map,
    center,
    zoom,
    places,
    selectedPlace,
    isLoading: isLoading || isInitializing,
    error,
    setMapPosition,
    moveToCurrentLocation: moveToCurrentLocationWithMarker,
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