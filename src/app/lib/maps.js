// src/lib/maps.js

// Google Maps API 로드 상태 확인
export const isMapsApiLoaded = () => {
    const isLoaded = typeof window !== 'undefined' && 
      window.google && 
      window.google.maps && 
      window.google.maps.places;
    if (isLoaded) {
      console.log('Google Maps API가 로드되었습니다.');
    }
    return isLoaded;
  };
  
  // Google Maps API 로더 초기화 (개선된 버전)
  export const initMapsApi = () => {
    // 이미 로드되어 있는지 확인
    if (isMapsApiLoaded()) {
      return Promise.resolve(window.google.maps);
    }
    
    // API가 아직 로드되지 않았으면 스크립트 로드 시도
    return new Promise((resolve, reject) => {
      // 이미 스크립트가 로드 중인지 확인
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
        console.log('Google Maps API 스크립트가 이미 로드 중입니다. 완료될 때까지 대기합니다.');
        
        // 스크립트가 로드될 때까지 대기
        let attempts = 0;
        const maxAttempts = 100; // 최대 10초 (100ms * 100)
        
        const checkInterval = setInterval(() => {
          attempts++;
          if (isMapsApiLoaded()) {
            clearInterval(checkInterval);
            console.log('Google Maps API 로드 확인됨');
            resolve(window.google.maps);
          } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            const error = new Error('Google Maps API 로드 시간 초과');
            console.error(error);
            reject(error);
          }
        }, 100);
        
        return;
      }
      
      // 스크립트가 아직 로드되지 않았으면 직접 로드
      try {
        console.log('Google Maps API 스크립트 로드 시도...');
        
        // API 키 확인 (환경 변수 또는 기본값)
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        
        if (!apiKey) {
          console.warn('Google Maps API 키가 설정되지 않았습니다.');
        }
        
        // 스크립트 엘리먼트 생성
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
        script.async = true;
        script.defer = true;
        
        // 콜백 함수 설정
        window.initGoogleMapsCallback = () => {
          console.log('Google Maps API 로드 완료 (콜백)');
          resolve(window.google.maps);
          delete window.initGoogleMapsCallback;
        };
        
        // 오류 처리
        script.onerror = (error) => {
          console.error('Google Maps API 스크립트 로드 실패:', error);
          reject(new Error('Google Maps API 스크립트 로드 실패'));
        };
        
        // 스크립트 추가
        document.head.appendChild(script);
      } catch (error) {
        console.error('Google Maps API 스크립트 추가 오류:', error);
        reject(error);
      }
    });
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
  
      console.log('지도 초기화 시작, DOM 요소:', mapRef.current);
  
      // API 로드 상태 확인 및 로드
      if (!isMapsApiLoaded()) {
        try {
          console.log('Google Maps API 로드 대기 중...');
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
      
      console.log('지도 생성 시도 중...', { 
        element: mapRef.current, 
        options: { 
          center: mapOptions.center, 
          zoom: mapOptions.zoom 
        }
      });
  
      // 지도 생성
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      console.log('지도 인스턴스 생성 완료');
      
      return map;
    } catch (error) {
      console.error('지도 초기화 오류:', error);
      console.error('오류 상세 정보:', error.message, error.stack);
      return null;
    }
  };
  
  // 마커 생성
  export const createMarker = (map, position, options = {}) => {
    if (!map || !position) return null;
    
    try {
      const {
        title = '',
        markerColor = '#4169E1', // 기본 색상을 로얄 블루로 설정
        customMarker = false,
        markerText = '',
        markerSize = 36,  // 기본 크기를 절반으로 줄임 (36 → 18)
        markerTextColor = '#FFFFFF',
        markerTextSize = '14px',  // 텍스트 크기도 약간 줄임
        animation,
        draggable = false
      } = options;
      
      let markerOptions = {
        position,
        map,
        title,
        animation,
        draggable
      };

      // 커스텀 마커 사용 시
      if (customMarker) {
        // 더 간단한 원형 마커 SVG 경로 사용
        const svgMarker = {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeWeight: 1,
          strokeColor: '#FFFFFF',
          scale: markerSize / 3,  // 크기 조정 (기존 /2에서 /4로 변경하여 더 작게)
        };

        markerOptions.icon = svgMarker;
        
        // 마커 내부에 텍스트 추가
        if (markerText) {
          markerOptions.label = {
            text: markerText,
            color: markerTextColor,
            fontSize: markerTextSize,
            fontWeight: 'bold'
          };
        }
      } else {
        // 기본 원형 마커 사용
        markerOptions.icon = {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeWeight: 1,
          strokeColor: '#FFFFFF',
          scale: 15  // 기본 마커 크기도 절반으로 줄임 (10 → 5)
        };
      }
      
      const marker = new window.google.maps.Marker(markerOptions);
      
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
  
  // 장소 검색 기능 개선
  export const searchPlaceByQuery = (query) => {
    return new Promise((resolve, reject) => {
      if (!isMapsApiLoaded()) {
        reject(new Error('Google Maps API가 로드되지 않았습니다.'));
        return;
      }
      
      // 한국 지역으로 제한하기 위한 바운드 설정
      const koreaBounds = new window.google.maps.LatLngBounds(
        new window.google.maps.LatLng(33.0, 124.5),  // 남서쪽 경계
        new window.google.maps.LatLng(38.9, 131.9)   // 북동쪽 경계
      );
      
      // Geocoder 인스턴스 생성
      const geocoder = new window.google.maps.Geocoder();
      
      // 검색 요청 - 한국 지역으로 제한하고 언어 설정
      geocoder.geocode({
        address: query,
        bounds: koreaBounds,
        componentRestrictions: { country: 'kr' },
        language: 'ko'
      }, (results, status) => {
        if (status === window.google.maps.GeocoderStatus.OK && results.length > 0) {
          const location = results[0].geometry.location;
          const place = {
            id: results[0].place_id,
            name: results[0].formatted_address,
            address: results[0].formatted_address,
            location: {
              lat: location.lat(),
              lng: location.lng()
            }
          };
          resolve(place);
        } else if (status === window.google.maps.GeocoderStatus.ZERO_RESULTS) {
          // 결과가 없을 경우 지역명에 '동'을 추가하여 다시 시도
          const modifiedQuery = query.endsWith('동') ? query : `${query}동`;
          
          geocoder.geocode({
            address: modifiedQuery,
            bounds: koreaBounds,
            componentRestrictions: { country: 'kr' },
            language: 'ko'
          }, (modifiedResults, modifiedStatus) => {
            if (modifiedStatus === window.google.maps.GeocoderStatus.OK && modifiedResults.length > 0) {
              const modifiedLocation = modifiedResults[0].geometry.location;
              const modifiedPlace = {
                id: modifiedResults[0].place_id,
                name: modifiedResults[0].formatted_address,
                address: modifiedResults[0].formatted_address,
                location: {
                  lat: modifiedLocation.lat(),
                  lng: modifiedLocation.lng()
                }
              };
              resolve(modifiedPlace);
            } else {
              // 그래도 결과가 없으면 서울을 붙여서 다시 시도
              const seoulQuery = `서울 ${query}`;
              
              geocoder.geocode({
                address: seoulQuery,
                bounds: koreaBounds,
                componentRestrictions: { country: 'kr' },
                language: 'ko'
              }, (seoulResults, seoulStatus) => {
                if (seoulStatus === window.google.maps.GeocoderStatus.OK && seoulResults.length > 0) {
                  const seoulLocation = seoulResults[0].geometry.location;
                  const seoulPlace = {
                    id: seoulResults[0].place_id,
                    name: seoulResults[0].formatted_address,
                    address: seoulResults[0].formatted_address,
                    location: {
                      lat: seoulLocation.lat(),
                      lng: seoulLocation.lng()
                    }
                  };
                  resolve(seoulPlace);
                } else {
                  reject(new Error(`장소 검색 실패: ${seoulStatus}`));
                }
              });
            }
          });
        } else {
          reject(new Error(`장소 검색 실패: ${status}`));
        }
      });
    });
  };
  
  // 장소 상세 정보 가져오기
  export const getPlaceDetails = async (placeId, options = {}) => {
    try {
      // Google Maps API 로드 확인
      if (!isMapsApiLoaded()) {
        console.log('Places API가 로드되지 않았습니다. API 로드 시도 중...');
        await initMapsApi();
        
        // Places API가 로드되었는지 다시 확인
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Maps Places API가 로드되지 않았습니다. Google Cloud Console에서 Places API를 활성화해주세요.');
        }
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
  
  // MarkerClusterer 라이브러리 동적 로드 함수 개선 - 변경된 부분
  const loadMarkerClusterer = () => {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement('script');
        // 최신 버전의 MarkerClusterer 라이브러리 URL로 업데이트
        script.src = 'https://unpkg.com/@googlemaps/markerclusterer@2.0.8/dist/index.min.js';
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          console.log('MarkerClusterer 라이브러리 로드 완료');
          resolve();
        };
        
        script.onerror = (error) => {
          console.error('MarkerClusterer 라이브러리 로드 실패:', error);
          reject(error);
        };
        
        document.head.appendChild(script);
      } catch (error) {
        console.error('MarkerClusterer 스크립트 로드 오류:', error);
        reject(error);
      }
    });
  };
  
  // 마커 클러스터러 초기화 (최신 API 방식으로 수정) - 주요 변경 부분
  export const initMarkerClusterer = async (map, markers, options = {}) => {
    try {
      // Google Maps API 로드 확인
      if (!isMapsApiLoaded()) {
        await initMapsApi();
      }
      
      // 마커 클러스터러 라이브러리 동적 로드
      await loadMarkerClusterer();
      
      // 클러스터러 라이브러리가 올바르게 로드되었는지 확인
      if (typeof window.markerClusterer === 'undefined') {
        console.warn('MarkerClusterer 라이브러리가 올바르게 로드되지 않았습니다.');
        
        // 대체 방식으로 마커 클러스터링 시도
        if (window.google && window.google.maps.visualization && window.google.maps.visualization.MarkerClusterer) {
          // 구글 맵스 시각화 라이브러리의 MarkerClusterer 사용
          return new window.google.maps.visualization.MarkerClusterer(map, markers, {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            gridSize: 50,
            maxZoom: 15,
            minimumClusterSize: 2
          });
        }
        
        // 마커 클러스터러를 지원하지 않는 경우, 마커만 표시
        console.warn('마커 클러스터링을 사용할 수 없습니다. 일반 마커만 표시합니다.');
        return null;
      }
      
      // 최신 MarkerClusterer API 사용
      const markerClusterer = new window.markerClusterer.MarkerClusterer({
        map,
        markers,
        algorithm: new window.markerClusterer.GridAlgorithm({
          gridSize: 50,
          maxZoom: 15,
          minClusterSize: 2
        }),
        renderer: {
          render: ({ count, position }) => {
            return new google.maps.Marker({
              position,
              label: { text: String(count), color: "white" },
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: options.clusterColor || "#4169E1",
                fillOpacity: 0.7,
                scale: 20,
                strokeColor: "white",
                strokeWeight: 2,
              }
            });
          }
        }
      });
      
      return markerClusterer;
    } catch (error) {
      console.error('마커 클러스터러 초기화 오류:', error);
      // 오류 발생 시에도 마커는 계속 표시
      return null;
    }
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

  // Google Places API를 사용한 장소 검색 함수
export const searchGooglePlaces = async (query, options = {}) => {
    try {
      // Google Maps API 로드 확인
      if (!isMapsApiLoaded()) {
        console.log('Places API가 로드되지 않았습니다. API 로드 시도 중...');
        await initMapsApi();
        
        // Places API가 로드되었는지 다시 확인
        if (!window.google || !window.google.maps || !window.google.maps.places) {
          throw new Error('Google Maps Places API가 로드되지 않았습니다.');
        }
      }
      
      return new Promise((resolve, reject) => {
        // PlacesService 인스턴스 생성
        const placesService = new window.google.maps.places.PlacesService(
          document.createElement('div')
        );
        
        // 검색 요청 설정
        const request = {
          query,
          fields: ['name', 'place_id', 'formatted_address', 'geometry', 'photos', 'types'],
          locationBias: options.locationBias || {
            // 한국 중심 바운드
            center: { lat: 37.5665, lng: 126.9780 }, // 서울 중심
            radius: options.radius || 50000 // 기본 50km 반경
          },
          language: options.language || 'ko',
          types: options.types || []
        };
        
        // 텍스트 검색 요청
        placesService.textSearch(request, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            try {
              // 결과 포맷팅
              const formattedResults = results
                .filter(place => place && place.geometry && place.geometry.location)
                .map(place => {
                  // 위치 정보 안전하게 접근
                  let lat = 0, lng = 0;
                  try {
                    if (place.geometry.location) {
                      lat = typeof place.geometry.location.lat === 'function' ? 
                            place.geometry.location.lat() : 
                            (place.geometry.location.lat || 0);
                      
                      lng = typeof place.geometry.location.lng === 'function' ? 
                            place.geometry.location.lng() : 
                            (place.geometry.location.lng || 0);
                    }
                  } catch (locError) {
                    console.error('위치 정보 접근 오류:', locError);
                  }
                  
                  return {
                    id: place.place_id || '',
                    name: place.name || '',
                    address: place.formatted_address || '',
                    location: { lat, lng },
                    types: place.types || [],
                    photos: place.photos ? 
                      place.photos
                        .filter(photo => photo && typeof photo.getUrl === 'function')
                        .map(photo => photo.getUrl({ maxWidth: 400, maxHeight: 300 })) : 
                      []
                  };
                });
              
              resolve(formattedResults);
            } catch (formatError) {
              console.error('장소 결과 형식 변환 오류:', formatError);
              // 오류가 있더라도 빈 배열 반환하여 UI가 깨지지 않도록 함
              resolve([]);
            }
          } else if (status === window.google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
            resolve([]);
          } else {
            console.error('장소 검색 오류:', status);
            reject(new Error(`장소 검색 오류: ${status}`));
          }
        });
      });
    } catch (error) {
      console.error('장소 검색 오류:', error);
      // 오류 발생 시 빈 배열 반환하여 UI가 깨지지 않도록 함
      return [];
    }
  };