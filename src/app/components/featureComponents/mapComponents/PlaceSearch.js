// src/components/map/PlaceSearch.js
'use client';

import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiX, FiLoader } from 'react-icons/fi';
import usePlaces from '@app/hooks/usePlaces';

/**
 * 장소 검색 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {Function} props.onPlaceSelect - 장소 선택 시 콜백 함수
 * @param {boolean} props.useAutocomplete - Google 자동완성 사용 여부 (기본값: true)
 * @param {string} props.placeholder - 검색창 플레이스홀더 (기본값: '장소 검색...')
 * @param {string} props.className - 추가 CSS 클래스
 */
const PlaceSearch = ({
  onPlaceSelect,
  useAutocomplete = true,
  placeholder = '장소 검색...',
  className = ''
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  // 장소 검색 훅 초기화
  const {
    searchInputRef,
    searchResults,
    searchQuery,
    isLoading,
    error,
    handleSearchChange,
    clearSearch,
    selectPlace
  } = usePlaces({
    autoCompleteEnabled: useAutocomplete
  });

  // 컴포넌트 마운트 시 검색창 포커스
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 장소 선택 핸들러
  const handleSelectPlace = (place) => {
    selectPlace(place);
    
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
    
    clearSearch();
  };

  // 검색창 클리어 버튼
  const handleClearSearch = () => {
    clearSearch();
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {/* 검색 아이콘 */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>

        {/* 검색 입력창 */}
        <input
          ref={useAutocomplete ? searchInputRef : inputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 200)}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />

        {/* 로딩 인디케이터 또는 클리어 버튼 */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {isLoading ? (
            <FiLoader className="h-5 w-5 text-gray-400 animate-spin" />
          ) : searchQuery ? (
            <button
              onClick={handleClearSearch}
              className="text-gray-400 hover:text-gray-600"
              aria-label="검색어 지우기"
            >
              <FiX className="h-5 w-5" />
            </button>
          ) : null}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mt-1 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* 검색 결과 목록 */}
      {focused && searchResults.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {searchResults.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelectPlace(place)}
              className="cursor-pointer hover:bg-gray-100 px-4 py-2"
            >
              <div className="font-medium">{place.name}</div>
              <div className="text-sm text-gray-500">{place.address}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaceSearch;