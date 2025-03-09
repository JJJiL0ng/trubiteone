// src/components/layoutComponents/Header.js
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { FiMenu, FiX, FiMapPin, FiAward, FiUser, FiPlusCircle, FiPhone, FiInstagram } from 'react-icons/fi';
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
  
  // URL 변경 시 메뉴 닫기
  useEffect(() => {
    closeMenu();
  }, [pathname]);
  
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
    // 메뉴가 열릴 때 스크롤 방지
    if (!isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };
  
  // 모바일 메뉴 닫기
  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
  };
  
  // 현재 활성화된 메뉴 확인
  const isActive = (path) => {
    return pathname === path;
  };
  
  // 헤더 높이를 CSS 변수로 설정
  useEffect(() => {
    const headerHeight = document.querySelector('header')?.offsetHeight || 64;
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    
    // 리사이즈 이벤트 리스너 추가
    const updateHeaderHeight = () => {
      const height = document.querySelector('header')?.offsetHeight || 64;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    };
    
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);
  
  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-1' : 'bg-transparent py-2'
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
              <Link href="/login">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                  3초 로그인&회원가입
                </button>
              </Link>
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
      
      {/* 모바일 사이드 메뉴 오버레이 */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 md:hidden ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeMenu}
      ></div>
      
      {/* 모바일 사이드 메뉴 */}
      <div 
        className={`fixed top-0 right-0 w-[70%] h-full bg-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <span className="text-lg font-semibold">메뉴</span>
          <button onClick={closeMenu} aria-label="메뉴 닫기">
            <FiX size={24} />
          </button>
        </div>
        
        {/* 사용자 프로필 영역 */}
        {isAuthenticated ? (
          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3">
                {user?.photoURL ? (
                  <Image 
                    src={user.photoURL} 
                    alt={user.displayName || '사용자'}
                    width={48}
                    height={48}
                    className="object-cover"
                  />
                ) : (
                  <FiUser className="w-full h-full p-3 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium">{user?.displayName || '사용자'}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b">
            <Link href="/login">
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
                3초 로그인
              </button>
            </Link>
          </div>
        )}
        
        {/* 메뉴 항목 */}
        <nav className="p-4">
          <ul className="space-y-4">
            <li>
              <Link 
                href="/" 
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeMenu}
              >
                <FiMapPin className="mr-3" size={20} />
                <span>지도</span>
              </Link>
            </li>
            
            <li>
              <Link 
                href="/rank" 
                className={`flex items-center p-2 rounded-lg ${
                  isActive('/rank') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={closeMenu}
              >
                <FiAward className="mr-3" size={20} />
                <span>랭킹</span>
              </Link>
            </li>
            
            {isAuthenticated && (
              <li>
                <Link 
                  href="/addMyFavorite" 
                  className={`flex items-center p-2 rounded-lg ${
                    isActive('/addMyFavorite') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={closeMenu}
                >
                  <FiPlusCircle className="mr-3" size={20} />
                  <span>원픽 관리</span>
                </Link>
              </li>
            )}
          </ul>
        </nav>
        
        {/* 로그아웃 버튼 */}
        {isAuthenticated && (
          <div className="absolute bottom-20 left-0 right-0 px-4">
            <button
              onClick={() => {
                logout();
                closeMenu();
              }}
              className="w-full flex items-center justify-center p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            >
              <span>로그아웃</span>
            </button>
          </div>
        )}
        
        {/* 모바일 메뉴 푸터 정보 */}
        <div className="absolute bottom-0 left-0 right-0 bg-gray-100 p-4 text-xs border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                &copy; {new Date().getFullYear()} Lean1st
              </p>
              <div className="flex space-x-4">
                <Link
                  href="tel:01094123957"
                  className="text-gray-600 hover:text-blue-600 flex items-center"
                  aria-label="전화번호"
                >
                  <FiPhone className="mr-1" size={14} />
                  <span>연락처</span>
                </Link>
                
                <Link
                  href="https://www.instagram.com/jjjil0ng/profilecard/?igsh=cWV6bnZ1b2QwcWJ2"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-600 flex items-center"
                  aria-label="인스타그램"
                >
                  <FiInstagram className="mr-1" size={14} />
                  <span>인스타</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;