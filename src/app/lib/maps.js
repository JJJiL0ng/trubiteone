// src/lib/maps.js
import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API 로더 인스턴스
let mapsApiLoader = null;
let mapsApiLoadPromise = null;

// // Google Maps API 로더 초기화
// export const initMapsApi = () => {
//   if (!mapsApiLoader) {
//     mapsApiLoader = new Loader({
//       apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
//       version: 'weekly',
//       libraries: ['places']
//     });
    
//     mapsApiLoadPromise = mapsApiLoader.load();
//   }
  
//   return mapsApiLoadPromise;
// };
// src/lib/maps.js의 initMapsApi 함수 수정
// export const initMapsApi = () => {
//     if (!mapsApiLoader) {
//       mapsApiLoader = new Loader({
//         apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
//         version: 'weekly',
//         libraries: ['places'],
//         // 중요: async 옵션 추가
//         loading: 'async'
//       });
      
//       mapsApiLoadPromise = mapsApiLoader.load().catch(error => {
//         console.error('Google Maps API 로드 오류:', error);
//         return Promise.reject(error);
//       });
//     }
    
//     return mapsApiLoadPromise;
//   };
// src/lib/maps.js의 initMapsApi 함수 수정
export const initMapsApi = () => {
    if (!mapsApiLoader) {
      // API 키 확인 로직 추가
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        console.error('Google Maps API 키가 설정되지 않았습니다.');
        return Promise.reject(new Error('Google Maps API 키가 설정되지 않았습니다.'));
      }
      
      mapsApiLoader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places'],
        loading: 'async'
      });
      
      mapsApiLoadPromise = mapsApiLoader.load().catch(error => {
        console.error('Google Maps API 로드 오류:', error);
        return Promise.reject(error);
      });
    }
    
    return mapsApiLoadPromise;
  };
// // Google Maps API가 로드되어 있는지 확인
// export const isMapsApiLoaded = () => {
//   return typeof window !== 'undefined' && window.google && window.google.maps;
// };


// isMapsApiLoaded 함수 개선
export const isMapsApiLoaded = () => {
    const isLoaded = typeof window !== 'undefined' && window.google && window.google.maps;
    
    // 이미 로드된 경우 경고 로그 제거
    if (isLoaded && mapsApiLoader) {
      console.log('Google Maps API가 이미 로드되어 있습니다.');
    }
    
    return isLoaded;
  };
// 현재 위치 가져오기
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser.'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        reject(error);
      },
      { timeout: 10000, maximumAge: 60000 }
    );
  });
};


// 기본 위치 (서울시청)
export const DEFAULT_CENTER = { lat: 37.5665, lng: 126.9780 };
export const DEFAULT_ZOOM = 14;

// 지도 초기화
export const initMap = async (mapRef, options = {}) => {
  try {
    if (!mapRef || !mapRef.current) {
      console.error('유효한 지도 참조가 없습니다.');
      return null;
    }

    // API 로드 상태 확인 및 로드
    if (!isMapsApiLoaded()) {
      try {
        await initMapsApi();
        console.log('Google Maps API 로드 완료');
      } catch (error) {
        console.error('Google Maps API 로드 실패:', error);
        throw error;
      }
    }
    
    // window.google 객체 확인
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API가 로드되지 않았습니다.');
      throw new Error('Google Maps API가 로드되지 않았습니다.');
    }
    
    // 지도 옵션 설정
    const mapOptions = {
      center: options.center || DEFAULT_CENTER,
      zoom: options.zoom || DEFAULT_ZOOM,
      mapTypeControl: options.mapTypeControl !== undefined ? options.mapTypeControl : true,
      streetViewControl: options.streetViewControl !== undefined ? options.streetViewControl : false,
      fullscreenControl: options.fullscreenControl !== undefined ? options.fullscreenControl : true,
      zoomControl: options.zoomControl !== undefined ? options.zoomControl : true,
      styles: options.styles || [],
      gestureHandling: options.gestureHandling || 'cooperative',
      ...options
    };
    
    // 지도 생성
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    console.log('지도 인스턴스 생성 완료');
    
    return map;
  } catch (error) {
    console.error('지도 초기화 오류:', error);
    return null;
  }
};

// 마커 생성
export const createMarker = (map, position, options = {}) => {
  if (!map || !position) return null;
  
  try {
    const marker = new window.google.maps.Marker({
      position,
      map,
      title: options.title || '',
      icon: options.icon,
      animation: options.animation,
      draggable: options.draggable || false,
      ...options
    });
    
    return marker;
  } catch (error) {
    console.error('마커 생성 오류:', error);
    return null;
  }
};

// 정보창(InfoWindow) 생성
export const createInfoWindow = (content, options = {}) => {
  try {
    return new window.google.maps.InfoWindow({
      content,
      maxWidth: options.maxWidth || 250,
      ...options
    });
  } catch (error) {
    console.error('정보창 생성 오류:', error);
    return null;
  }
};

// 장소 검색
export const searchPlaces = async (query, options = {}) => {
  try {
    // Google Maps API 로드 확인
    if (!isMapsApiLoaded()) {
      await initMapsApi();
    }
    
    return new Promise((resolve, reject) => {
      // PlacesService 인스턴스 생성
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      // 검색 요청 설정
      const request = {
        query,
        fields: options.fields || ['name', 'geometry', 'formatted_address', 'place_id'],
        ...options
      };
      
      // 텍스트 검색 실행
      placesService.findPlaceFromQuery(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(results);
        } else {
          console.error('장소 검색 오류:', status);
          reject(new Error(`장소 검색 오류: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('장소 검색 오류:', error);
    throw error;
  }
};

// 장소 상세 정보 가져오기
export const getPlaceDetails = async (placeId, options = {}) => {
  try {
    // Google Maps API 로드 확인
    if (!isMapsApiLoaded()) {
      await initMapsApi();
    }
    
    return new Promise((resolve, reject) => {
      // PlacesService 인스턴스 생성
      const placesService = new window.google.maps.places.PlacesService(
        document.createElement('div')
      );
      
      // 검색 요청 설정
      const request = {
        placeId,
        fields: options.fields || [
          'name',
          'place_id',
          'formatted_address',
          'geometry',
          'photos',
          'types',
          'website',
          'formatted_phone_number',
          'opening_hours',
          'rating'
        ],
        ...options
      };
      
      // 장소 상세 정보 요청
      placesService.getDetails(request, (result, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(result);
        } else {
          console.error('장소 상세 정보 가져오기 오류:', status);
          reject(new Error(`장소 상세 정보 가져오기 오류: ${status}`));
        }
      });
    });
  } catch (error) {
    console.error('장소 상세 정보 가져오기 오류:', error);
    throw error;
  }
};

// 마커 클러스터러 초기화
export const initMarkerClusterer = async (map, markers) => {
  try {
    // Google Maps API 로드 확인
    if (!isMapsApiLoaded()) {
      await initMapsApi();
    }
    
    // 마커 클러스터러 라이브러리 동적 로드
    if (typeof window.MarkerClusterer === 'undefined') {
      // MarkerClusterer Plus 라이브러리 동적 로드
      await loadMarkerClusterer();
    }
    
    // 마커 클러스터러 생성
    const markerClusterer = new window.MarkerClusterer(map, markers, {
      imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
      gridSize: 50,
      maxZoom: 15,
      minimumClusterSize: 2
    });
    
    return markerClusterer;
  } catch (error) {
    console.error('마커 클러스터러 초기화 오류:', error);
    return null;
  }
};

// // MarkerClusterer 라이브러리 동적 로드
// const loadMarkerClusterer = () => {
//   return new Promise((resolve, reject) => {
//     try {
//       const script = document.createElement('script');
//       script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
//       script.async = true;
//       script.onload = () => resolve();
//       script.onerror = (error) => reject(error);
//       document.head.appendChild(script);
//     } catch (error) {
//       reject(error);
//     }
//   });
// };
// MarkerClusterer 라이브러리 로딩 방식 수정
// const loadMarkerClusterer = () => {
//     // 이미 로드되었는지 확인
//     if (typeof window.MarkerClusterer !== 'undefined') {
//       return Promise.resolve();
//     }
    
//     return new Promise((resolve, reject) => {
//       try {
//         const script = document.createElement('script');
//         script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
//         script.async = true;
//         script.defer = true; // defer 추가
//         script.onload = () => resolve();
//         script.onerror = (error) => reject(error);
//         document.head.appendChild(script);
//       } catch (error) {
//         reject(error);
//       }
//     });
//   };

// MarkerClusterer 라이브러리 동적 로드 함수 개선
const loadMarkerClusterer = () => {
    // 이미 로드되었는지 확인
    if (typeof window.MarkerClusterer !== 'undefined') {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@googlemaps/markerclusterer/dist/index.min.js';
        script.async = true;
        script.defer = true; // defer 추가
        script.onload = () => resolve();
        script.onerror = (error) => reject(error);
        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });
  };
// 지도 경계 조정
export const fitBounds = (map, markers) => {
  if (!map || !markers || markers.length === 0) return;
  
  try {
    const bounds = new window.google.maps.LatLngBounds();
    
    markers.forEach(marker => {
      bounds.extend(marker.getPosition());
    });
    
    map.fitBounds(bounds);
    
    // 줌 레벨 조정 (너무 가까우면 줌 아웃)
    const listener = window.google.maps.event.addListener(map, 'idle', () => {
      if (map.getZoom() > 18) {
        map.setZoom(18);
      }
      window.google.maps.event.removeListener(listener);
    });
  } catch (error) {
    console.error('지도 경계 조정 오류:', error);
  }
};

// 자동완성 기능 초기화
export const initAutocomplete = (inputRef, options = {}) => {
  if (!inputRef || !inputRef.current || !isMapsApiLoaded()) return null;
  
  try {
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: options.types || ['establishment'],
      fields: options.fields || ['place_id', 'geometry', 'name', 'formatted_address'],
      componentRestrictions: options.componentRestrictions,
      strictBounds: options.strictBounds || false
    });
    
    return autocomplete;
  } catch (error) {
    console.error('자동완성 초기화 오류:', error);
    return null;
  }
};

// 좌표 거리 계산 (km)
export const calculateDistance = (point1, point2) => {
  if (!point1 || !point2) return 0;
  
  try {
    const lat1 = point1.lat;
    const lon1 = point1.lng;
    const lat2 = point2.lat;
    const lon2 = point2.lng;
    
    const R = 6371; // 지구 반경 (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
      
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // 거리 (km)
    
    return distance;
  } catch (error) {
    console.error('거리 계산 오류:', error);
    return 0;
  }
};
