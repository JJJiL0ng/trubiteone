// src/components/layoutComponents/Footer.js
'use client';

import Link from 'next/link';
import { FiPhone, FiInstagram } from 'react-icons/fi';

/**
 * 푸터 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.className - 추가 CSS 클래스
 */
const Footer = ({ className = '' }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className={`bg-gray-800 text-white py-4 ${className}`}>
      <div className="container mx-auto px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* 회사 정보 */}
          <div>
            <p className="text-gray-400 text-sm">
              &copy; {currentYear} Lean1st. All rights reserved.
            </p>
          </div>
          
          {/* 연락처 */}
          <div className="mt-3 md:mt-0 flex items-center space-x-6">
            <Link
              href="tel:01094123957"
              className="text-gray-400 hover:text-white flex items-center"
              aria-label="전화번호"
            >
              <FiPhone className="mr-2" size={18} />
              <span>연락처번호</span>
            </Link>
            
            <Link
              href="https://www.instagram.com/jjjil0ng/profilecard/?igsh=cWV6bnZ1b2QwcWJ2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white flex items-center"
              aria-label="인스타그램"
            >
              <FiInstagram className="mr-2" size={18} />
              <span>인스타아이디</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;