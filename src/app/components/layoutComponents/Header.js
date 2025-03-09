// src/components/layoutComponents/Header.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FiMenu, FiX, FiMapPin, FiAward, FiUser, FiPlusCircle } from 'react-icons/fi';
import useAuth from '@app/hooks/useAuth';
import LoginButton from '@app/components/featureComponents/authComponents/LoginButton';

/**
 * 헤더 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.className - 추가 CSS 클래스
 */
const Header = ({ className = '' }) => {
  const pathname = usePathname();
  const { user, isAuthenticated, userData, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // 스크롤에 따른 헤더 스타일 변경
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // 메뉴 토글
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  // 모바일 메뉴 닫기
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  // 현재 활성화된 메뉴 확인
  const isActive = (path) => {
    return pathname === path;
  };
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-transparent py-4'
      } ${className}`}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* 로고 */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-blue-600">TruBite.one</span>
          </Link>
          
          {/* 데스크탑 메뉴 */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`flex items-center ${isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
            >
              <FiMapPin className="mr-1" />
              <span>지도</span>
            </Link>
            
            <Link 
              href="/rank" 
              className={`flex items-center ${isActive('/rank') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
            >
              <FiAward className="mr-1" />
              <span>랭킹</span>
            </Link>
            
            {isAuthenticated && (
              <Link 
                href="/addMyFavorite" 
                className={`flex items-center ${isActive('/addMyFavorite') ? 'text-blue-600 font-medium' : 'text-gray-700 hover:text-blue-600'}`}
              >
                <FiPlusCircle className="mr-1" />
                <span>원픽 등록</span>
              </Link>
            )}
            
            {/* 로그인 버튼 또는 프로필 */}
            {isAuthenticated ? (
              <>
                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex items-center p-2">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                    {user?.photoURL ? (
                      <Image 
                        src={user.photoURL} 
                        alt={user.displayName || '사용자'}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    ) : (
                      <FiUser className="w-full h-full p-2 text-gray-600" />
                    )}
                  </div>
                  <span className="text-gray-800 font-medium">{user?.displayName || '사용자'}</span>
                </div>
                <button
                  onClick={() => {
                    logout();
                    closeMenu();
                  }}
                  className="flex items-center p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <span className="ml-3 text-base">로그아웃</span>
                </button>
              </>
            ) : (
              <LoginButton />
            )}
          </nav>
          
          {/* 모바일 메뉴 토글 버튼 */}
          <button
            className="md:hidden"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
          >
            {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>
      
      {/* 모바일 메뉴 */}
      {isMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col space-y-4">
            <Link 
              href="/" 
              className={`flex items-center ${isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
              onClick={closeMenu}
            >
              <FiMapPin className="mr-2" />
              <span>지도</span>
            </Link>
            
            <Link 
              href="/rank" 
              className={`flex items-center ${isActive('/rank') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
              onClick={closeMenu}
            >
              <FiAward className="mr-2" />
              <span>랭킹</span>
            </Link>
            
            {isAuthenticated && (
              <Link 
                href="/addMyFavorite" 
                className={`flex items-center ${isActive('/addMyFavorite') ? 'text-blue-600 font-medium' : 'text-gray-700'}`}
                onClick={closeMenu}
              >
                <FiPlusCircle className="mr-2" />
                <span>원픽 등록</span>
              </Link>
            )}
            
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="flex items-center text-gray-700"
              >
                <span>로그아웃</span>
              </button>
            ) : (
              <div className="pt-2">
                <LoginButton className="w-full" />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;