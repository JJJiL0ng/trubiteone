'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FiSearch } from 'react-icons/fi';

/**
 * 검색창 컴포넌트 - 홈페이지에서만 표시
 */
const SearchBar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  
  // 현재 경로에 따라 검색창 표시 여부 결정
  useEffect(() => {
    setIsVisible(pathname === '/');
  }, [pathname]);
  
  // 검색창 높이를 CSS 변수로 설정
  useEffect(() => {
    if (isVisible) {
      // 검색창이 표시될 때 높이 측정 및 CSS 변수 설정
      const searchBarHeight = document.querySelector('.search-bar-container')?.offsetHeight || 56;
      document.documentElement.style.setProperty('--search-height', `${searchBarHeight}px`);
    } else {
      // 검색창이 숨겨질 때 높이를 0으로 설정
      document.documentElement.style.setProperty('--search-height', '0px');
    }
  }, [isVisible]);
  
  // 검색 핸들러
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 검색어를 URL 파라미터로 전달하여 홈페이지로 이동
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
      
      // 검색 이벤트 발생 - 커스텀 이벤트로 Map 컴포넌트에 알림
      const searchEvent = new CustomEvent('map:search', { 
        detail: { query: searchQuery } 
      });
      window.dispatchEvent(searchEvent);
    }
  };
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed top-12 left-0 right-0 z-40 bg-white shadow-md px-4 py-1 transition-all duration-300 search-bar-container">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="장소, 주소 검색"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-1.5 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <button 
          type="submit" 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 font-medium text-sm"
        >
          검색
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
