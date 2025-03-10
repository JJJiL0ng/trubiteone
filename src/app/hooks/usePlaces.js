// src/hooks/usePlaces.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getPlaceDetails as getGooglePlaceDetails,
  searchGooglePlaces,
  initAutocomplete
} from '@app/lib/maps';
import { getPlaceById, getTopPlaces } from '@app/lib/db';
import { debounce } from '@app/lib/utils';

/**
 * 장소 검색 및 관리 기능을 제공하는 커스텀 훅
 * @param {Object} options - 옵션 객체
 * @param {boolean} options.autoCompleteEnabled - 자동완성 기능 사용 여부 (기본값: false)
 * @param {boolean} options.initialLoad - 초기 로드 시 인기 장소를 가져올지 여부 (기본값: false)
 * @returns {Object} 장소 관련 상태 및 함수
 */
const usePlaces = (options = {}) => {
  const { 
    autoCompleteEnabled = false,
    initialLoad = false
  } = options;

  const router = useRouter();
  const [places, setPlaces] = useState([]);
  const [topPlaces, setTopPlaces] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // 디바운스된 검색 함수
  const debouncedSearch = useRef(
    debounce(async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        setIsLoading(true);
        const results = await searchGooglePlaces(query, {
          types: ['restaurant', 'cafe', 'food'], // 음식점 관련 장소로 필터링
          radius: 5000, // 5km 반경 내 검색 (미터 단위)
          language: 'ko' // 한국어 결과 우선
        });
        
        // 안전하게 결과 처리
        if (results && Array.isArray(results)) {
          // 검색 결과 포맷팅
          const formattedResults = results.map(place => {
            // 안전하게 위치 정보 처리
            const location = place.location || {};
            
            return {
              id: place.id || place.place_id || '',
              name: place.name || '',
              address: place.address || place.formatted_address || '',
              location: {
                lat: location.lat || 0,
                lng: location.lng || 0
              }
            };
          }).filter(item => item.id && item.name); // 유효한 데이터만 필터링
          
          setSearchResults(formattedResults);
        } else {
          setSearchResults([]);
        }
        
        setError(null);
      } catch (error) {
        console.error('장소 검색 오류:', error);
        setError('장소 검색 중 오류가 발생했습니다.');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  // 검색어 변경 핸들러
  const handleSearchChange = useCallback((e) => {
    const query = e.target.value;
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  // 검색어 초기화
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // 장소 상세 정보 가져오기 함수
  const getPlaceDetails = useCallback(async (placeId) => {
    if (!placeId) return null;
    
    try {
      setIsLoading(true);
      
      // Firestore에서 먼저 확인
      let placeDetails = await getPlaceById(placeId);
      
      if (!placeDetails) {
        // Firestore에 없으면 Google API로 가져오기
        try {
          const googlePlaceDetails = await getGooglePlaceDetails(placeId);
          
          if (googlePlaceDetails) {
            // Google API 응답 데이터 안전하게 처리
            const location = googlePlaceDetails.geometry && 
                            googlePlaceDetails.geometry.location ? 
                            googlePlaceDetails.geometry.location : null;
                            
            placeDetails = {
              id: googlePlaceDetails.place_id || placeId,
              name: googlePlaceDetails.name || '',
              address: googlePlaceDetails.formatted_address || '',
              location: location ? {
                lat: typeof location.lat === 'function' ? location.lat() : (location.lat || 0),
                lng: typeof location.lng === 'function' ? location.lng() : (location.lng || 0)
              } : { lat: 0, lng: 0 },
              phoneNumber: googlePlaceDetails.formatted_phone_number || '',
              website: googlePlaceDetails.website || '',
              photos: googlePlaceDetails.photos ? 
                googlePlaceDetails.photos.map(photo => ({
                  url: photo.getUrl ? photo.getUrl({ maxWidth: 400, maxHeight: 300 }) : '',
                })).filter(photo => photo.url).slice(0, 5) : [],
              types: googlePlaceDetails.types || []
            };
          }
        } catch (googleError) {
          console.error('Google Places API 오류:', googleError);
          // API 오류 시 기본 객체 반환
          placeDetails = {
            id: placeId,
            name: '정보 없음',
            address: '정보를 가져올 수 없습니다',
            location: { lat: 0, lng: 0 }
          };
        }
      }
      
      setIsLoading(false);
      return placeDetails;
    } catch (error) {
      console.error('장소 상세 정보 가져오기 오류:', error);
      setError('장소 상세 정보를 가져오는 중 오류가 발생했습니다.');
      setIsLoading(false);
      return null;
    }
  }, []);

  // 장소 선택 핸들러
  const selectPlace = useCallback(async (place) => {
    if (!place) return;
    
    setSelectedPlace(place);
    
    // 검색 결과에서 선택한 경우 검색어와 결과 초기화
    clearSearch();
    
    // 추가 정보 로드를 위해 Google API 호출
    if (place && place.id) {
      try {
        setIsLoading(true);
        
        // getPlaceDetails 함수를 사용하여 상세 정보 가져오기
        const placeDetails = await getPlaceDetails(place.id);
        
        if (placeDetails) {
          setSelectedPlace(placeDetails);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('장소 상세 정보 가져오기 오류:', error);
        setError('장소 상세 정보를 가져오는 중 오류가 발생했습니다.');
        setIsLoading(false);
      }
    }
  }, [clearSearch, getPlaceDetails]);

  // 장소 상세 페이지로 이동
  const navigateToPlace = useCallback((place) => {
    if (place && place.id) {
      router.push(`/reviews/${place.id}`);
    }
  }, [router]);

  // 원픽 맛집 추가 페이지로 이동
  const navigateToAddFavorite = useCallback((place) => {
    if (place && place.id) {
      // 장소 ID를 쿼리 파라미터로 전달
      router.push(`/addMyFavorite?placeId=${place.id}`);
    } else {
      router.push('/addMyFavorite');
    }
  }, [router]);

  // 인기 장소 로드
  const loadTopPlaces = useCallback(async (limit = 10) => {
    try {
      setIsLoading(true);
      const places = await getTopPlaces(limit);
      setTopPlaces(places || []);
      setError(null);
      setIsLoading(false);
      return places || [];
    } catch (error) {
      console.error('인기 장소 로드 오류:', error);
      setError('인기 장소를 불러오는 중 오류가 발생했습니다.');
      setIsLoading(false);
      return [];
    }
  }, []);

  // 자동완성 초기화
  useEffect(() => {
    if (autoCompleteEnabled && searchInputRef.current) {
      try {
        // Google Maps API가 로드된 후 자동완성 초기화
        const initializeAutocomplete = async () => {
          const autocomplete = await initAutocomplete(searchInputRef, {
            types: ['establishment'],
            fields: ['place_id', 'geometry', 'name', 'formatted_address']
          });
          
          if (autocomplete) {
            autocompleteRef.current = autocomplete;
            
            // 장소 선택 이벤트 리스너 추가
            autocomplete.addListener('place_changed', () => {
              const place = autocomplete.getPlace();
              
              if (place && place.place_id) {
                const location = place.geometry && place.geometry.location;
                
                const selectedPlace = {
                  id: place.place_id,
                  name: place.name || '',
                  address: place.formatted_address || '',
                  location: location ? {
                    lat: typeof location.lat === 'function' ? location.lat() : (location.lat || 0),
                    lng: typeof location.lng === 'function' ? location.lng() : (location.lng || 0)
                  } : { lat: 0, lng: 0 }
                };
                
                selectPlace(selectedPlace);
              }
            });
          }
        };
        
        initializeAutocomplete();
      } catch (error) {
        console.error('자동완성 초기화 오류:', error);
      }
    }
    
    return () => {
      // 자동완성 인스턴스 정리 (Google Maps API에서는 별도 정리 불필요)
      autocompleteRef.current = null;
    };
  }, [autoCompleteEnabled, selectPlace]);

  // 초기 로드 시 인기 장소 가져오기
  useEffect(() => {
    if (initialLoad) {
      loadTopPlaces();
    }
  }, [initialLoad, loadTopPlaces]);

  // 오류 초기화
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    places,
    topPlaces,
    selectedPlace,
    searchResults,
    searchQuery,
    isLoading,
    error,
    searchInputRef,
    handleSearchChange,
    clearSearch,
    selectPlace,
    navigateToPlace,
    navigateToAddFavorite,
    loadTopPlaces,
    clearError,
    getPlaceDetails
  };
};

export default usePlaces;