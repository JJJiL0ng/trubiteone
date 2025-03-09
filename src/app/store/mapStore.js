// src/store/mapStore.js
import { create } from 'zustand';
import { 
  DEFAULT_CENTER, 
  DEFAULT_ZOOM,
  getCurrentLocation,
  searchPlaces,
  getPlaceDetails
} from '@app/lib/maps';
import { getAllPlaces } from '@app/lib/db';
import { storage } from '@app/lib/utils';

// 지도 상태 스토어 생성
const useMapStore = create((set, get) => ({
  // 상태
  map: null,              // Google 지도 인스턴스
  center: DEFAULT_CENTER, // 지도 중심 좌표
  zoom: DEFAULT_ZOOM,     // 지도 줌 레벨
  markers: [],            // 지도에 표시된 마커 목록
  markerClusterer: null,  // 마커 클러스터러 인스턴스
  places: [],             // 장소 목록
  selectedPlace: null,    // 선택된 장소
  searchResults: [],      // 검색 결과
  isLoading: false,       // 로딩 상태
  error: null,            // 오류 메시지
  
  // 지도 인스턴스 설정
  setMap: (map) => {
    set({ map });
  },
  
  // 지도 상태 초기화 (페이지 이동 시 호출)
  resetMapState: () => {
    const { map, markers, markerClusterer } = get();
    
    // 마커 클러스터러 정리
    if (markerClusterer) {
      markerClusterer.clearMarkers();
    }
    
    // 각 마커 제거
    if (markers && markers.length > 0) {
      markers.forEach(marker => {
        if (marker) {
          if (window.google && window.google.maps) {
            window.google.maps.event.clearInstanceListeners(marker);
          }
          marker.setMap(null);
        }
      });
    }
    
    // 지도 이벤트 리스너 제거
    if (map && window.google && window.google.maps) {
      window.google.maps.event.clearInstanceListeners(map);
    }
    
    // 상태 초기화
    set({
      map: null,
      markers: [],
      markerClusterer: null,
      selectedPlace: null,
      searchResults: [],
      isLoading: false,
      error: null
    });
    
    console.log('지도 상태가 초기화되었습니다.');
  },
  
  // 지도 중심 및 줌 레벨 설정
  setMapPosition: (center, zoom) => {
    // 좌표 유효성 검사 추가
    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number' ||
        !isFinite(center.lat) || !isFinite(center.lng)) {
      console.warn('유효하지 않은 좌표:', center);
      return;
    }
    
    set({ center, zoom });
    
    // 지도 인스턴스가 있으면 중심과 줌 레벨 변경
    const { map } = get();
    if (map) {
      map.setCenter(center);
      map.setZoom(zoom);
    }
    
    // 마지막 위치 로컬 스토리지에 저장
    storage.set('last-map-position', { center, zoom });
  },
  
  // 사용자 현재 위치로 지도 이동
  moveToCurrentLocation: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // 현재 위치 가져오기
      const position = await getCurrentLocation();
      
      // 지도 위치 설정
      get().setMapPosition(position, 16); // 줌 레벨 16으로 설정
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('현재 위치로 이동 오류:', error);
      set({ 
        error: '현재 위치를 가져올 수 없습니다. 위치 액세스 권한을 확인해주세요.',
        isLoading: false
      });
      return false;
    }
  },
  
  // 이전에 저장된 지도 위치 불러오기
  loadSavedPosition: () => {
    const savedPosition = storage.get('last-map-position');
    
    if (savedPosition && savedPosition.center && savedPosition.zoom) {
      set({
        center: savedPosition.center,
        zoom: savedPosition.zoom
      });
      return true;
    }
    
    return false;
  },
  
  // 특정 장소로 지도 이동
  moveToPlace: (place) => {
    if (!place || !place.location) return;
    
    get().setMapPosition(place.location, 18); // 장소 확대를 위해 줌 레벨 18로 설정
    get().selectPlace(place);
  },
  
  // 장소 선택
  selectPlace: (place) => {
    set({ selectedPlace: place });
  },
  
  // 장소 선택 취소
  clearSelectedPlace: () => {
    set({ selectedPlace: null });
  },
  
  // 모든 장소 데이터 로드
  loadPlaces: async () => {
    try {
      set({ isLoading: true, error: null });
      
      // Firestore에서 모든 장소 가져오기
      const places = await getAllPlaces();
      
      set({ 
        places,
        isLoading: false
      });
      
      return places;
    } catch (error) {
      console.error('장소 로드 오류:', error);
      set({ 
        error: '장소 데이터를 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      });
      return [];
    }
  },
  
  // 장소 검색
  searchPlaces: async (query) => {
    if (!query) {
      set({ searchResults: [] });
      return [];
    }
    
    try {
      set({ isLoading: true, error: null });
      
      // Google Places API로 장소 검색
      const results = await searchPlaces(query, {
        fields: ['name', 'geometry', 'formatted_address', 'place_id']
      });
      
      // 검색 결과 포맷팅
      const formattedResults = results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        location: {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        }
      }));
      
      set({ 
        searchResults: formattedResults,
        isLoading: false
      });
      
      return formattedResults;
    } catch (error) {
      console.error('장소 검색 오류:', error);
      set({ 
        error: '장소 검색 중 오류가 발생했습니다.',
        isLoading: false,
        searchResults: []
      });
      return [];
    }
  },
  
  // 장소 상세 정보 가져오기
  getPlaceDetails: async (placeId) => {
    if (!placeId) return null;
    
    try {
      set({ isLoading: true, error: null });
      
      // Google Places API로 장소 상세 정보 가져오기
      const placeDetails = await getPlaceDetails(placeId);
      
      // 장소 데이터 포맷팅
      const formattedPlace = {
        id: placeDetails.place_id,
        name: placeDetails.name,
        address: placeDetails.formatted_address,
        location: {
          lat: placeDetails.geometry.location.lat(),
          lng: placeDetails.geometry.location.lng()
        },
        phoneNumber: placeDetails.formatted_phone_number || '',
        website: placeDetails.website || '',
        types: placeDetails.types || [],
        photos: placeDetails.photos ? 
          placeDetails.photos.map(photo => ({
            url: photo.getUrl(),
            width: photo.width,
            height: photo.height
          })) : [],
        rating: placeDetails.rating
      };
      
      set({ isLoading: false });
      
      return formattedPlace;
    } catch (error) {
      console.error('장소 상세 정보 가져오기 오류:', error);
      set({ 
        error: '장소 상세 정보를 가져오는 중 오류가 발생했습니다.',
        isLoading: false
      });
      return null;
    }
  },
  
  // 마커 목록 설정
  setMarkers: (markers) => {
    set({ markers });
  },
  
  // 마커 클러스터러 설정
  setMarkerClusterer: (markerClusterer) => {
    set({ markerClusterer });
  },
  
  // 모든 마커 제거
  clearMarkers: () => {
    const { markers, markerClusterer } = get();
    
    // 마커 클러스터러 정리
    if (markerClusterer) {
      markerClusterer.clearMarkers();
    }
    
    // 각 마커 제거
    if (markers && markers.length > 0) {
      markers.forEach(marker => {
        if (marker) marker.setMap(null);
      });
    }
    
    set({ markers: [], markerClusterer: null });
  },
  
  // 오류 메시지 초기화
  clearError: () => {
    set({ error: null });
  }
}));

export default useMapStore;