// src/hooks/usePlaces.js
import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getPlaceDetails as getGooglePlaceDetails,
  searchPlaces as searchGooglePlaces,
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
        const results = await searchGooglePlaces(query);
        
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
        
        setSearchResults(formattedResults);
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

  // 장소 선택 핸들러
  const selectPlace = useCallback(async (place) => {
    setSelectedPlace(place);
    
    // 검색 결과에서 선택한 경우 검색어와 결과 초기화
    clearSearch();
    
    // 추가 정보 로드를 위해 Google API 호출
    if (place && place.id) {
      try {
        setIsLoading(true);
        
        // Firestore에서 먼저 확인
        let placeDetails = await getPlaceById(place.id);
        
        if (!placeDetails) {
          // Firestore에 없으면 Google API로 가져오기
          const googlePlaceDetails = await getGooglePlaceDetails(place.id);
          
          if (googlePlaceDetails) {
            placeDetails = {
              id: googlePlaceDetails.place_id,
              name: googlePlaceDetails.name,
              address: googlePlaceDetails.formatted_address,
              location: {
                lat: googlePlaceDetails.geometry.location.lat(),
                lng: googlePlaceDetails.geometry.location.lng()
              },
              phoneNumber: googlePlaceDetails.formatted_phone_number || '',
              website: googlePlaceDetails.website || '',
              photos: googlePlaceDetails.photos ? 
                googlePlaceDetails.photos.map(photo => ({
                  url: photo.getUrl({ maxWidth: 400, maxHeight: 300 }),
                })).slice(0, 5) : [],
              types: googlePlaceDetails.types || []
            };
          }
        }
        
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
  }, [clearSearch]);

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
      setTopPlaces(places);
      setError(null);
      setIsLoading(false);
      return places;
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
                const selectedPlace = {
                  id: place.place_id,
                  name: place.name,
                  address: place.formatted_address,
                  location: {
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng()
                  }
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
    clearError
  };
};

export default usePlaces;