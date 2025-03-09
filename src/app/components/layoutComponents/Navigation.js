// src/components/layoutComponents/Navigation.js
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiMap, FiAward, FiUser } from 'react-icons/fi';
import useAuth from '@app/hooks/useAuth';
import { useState, useEffect } from 'react';

/**
 * 모바일용 하단 네비게이션 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.className - 추가 CSS 클래스
 */
const Navigation = ({ className = '' }) => {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const [clientAuth, setClientAuth] = useState(false);
  
  useEffect(() => {
    // 클라이언트 측에서만 인증 상태 업데이트
    setClientAuth(isAuthenticated);
  }, [isAuthenticated]);
  
  // 현재 활성화된 메뉴 확인
  const isActive = (path) => {
    return pathname === path;
  };
  
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 md:hidden z-40 ${className}`}>
      <div className="flex justify-around items-center">
        {/* 지도 (홈) */}
        <Link 
          href="/" 
          className={`flex flex-col items-center p-2 ${
            isActive('/') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <FiMap size={20} />
          <span className="text-xs mt-1">지도</span>
        </Link>
        
        {/* 랭킹 */}
        <Link 
          href="/rank" 
          className={`flex flex-col items-center p-2 ${
            isActive('/rank') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <FiAward size={20} />
          <span className="text-xs mt-1">랭킹</span>
        </Link>
        
        {/* 로그인/마이페이지 - 클라이언트 측 인증 상태 사용 */}
        <Link 
          href={clientAuth ? '/addMyFavorite' : '/login'} 
          className={`flex flex-col items-center p-2 ${
            isActive('/login') || isActive('/addMyFavorite') ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <FiUser size={20} />
          <span className="text-xs mt-1">{clientAuth ? '내 원픽' : '로그인'}</span>
        </Link>
      </div>
    </nav>
  );
};

export default Navigation;