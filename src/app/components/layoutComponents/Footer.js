// src/components/layoutComponents/Footer.js
'use client';

import Link from 'next/link';
import { FiMap, FiAward, FiGithub } from 'react-icons/fi';

/**
 * 푸터 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.className - 추가 CSS 클래스
 */
const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-gray-800 text-white py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* 로고 및 설명 */}
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-bold mb-2">원픽맛집</h2>
            <p className="text-gray-400 text-sm max-w-md">
              당신만의 단 하나의 최애 맛집을 공유하세요. 한 사람당 하나의 음식점만 추천하는 글로벌 맛집 플랫폼입니다.
            </p>
          </div>
          
          {/* 네비게이션 */}
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-8">
            <div>
              <h3 className="font-medium mb-3">메뉴</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-400 hover:text-white flex items-center">
                    <FiMap className="mr-2" />
                    <span>지도</span>
                  </Link>
                </li>
                <li>
                  <Link href="/rank" className="text-gray-400 hover:text-white flex items-center">
                    <FiAward className="mr-2" />
                    <span>랭킹</span>
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="text-gray-400 hover:text-white">
                    로그인
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-3">기술 스택</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Next.js 15.1.6</li>
                <li>Firebase</li>
                <li>Google Maps API</li>
                <li>Tailwind CSS</li>
                <li>Zustand</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* 카피라이트 */}
        <div className="mt-8 pt-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} 원픽맛집. All rights reserved.
          </p>
          
          <div className="mt-4 md:mt-0 flex items-center space-x-4">
            <a
              href="https://github.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white"
              aria-label="GitHub"
            >
              <FiGithub size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;