'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@app/components/layoutComponents/Header';
import SearchBar from '@app/components/layoutComponents/SearchBar';
import Script from 'next/script';
import { useState, useEffect } from 'react';

// 폰트 설정
const inter = Inter({ subsets: ['latin'] });

// 메타데이터는 클라이언트 컴포넌트에서 직접 사용할 수 없으므로 별도 파일로 분리하거나 다른 방식으로 처리해야 합니다
const metadata = {
  title: 'trubte.one - 당신만의 단 하나의 맛집을 공유하세요',
  description: '한 사람당 하나의 인생 음식점만 추천하는 글로벌 맛집 플랫폼입니다.',
};

export default function RootLayout({ children }) {
  const [isBottomSheetFullyOpen, setIsBottomSheetFullyOpen] = useState(false);

  useEffect(() => {
    const handleBottomSheetChange = (event) => {
      setIsBottomSheetFullyOpen(event.detail.isFullyOpen);
    };

    window.addEventListener('bottomSheetStateChange', handleBottomSheetChange);
    
    return () => {
      window.removeEventListener('bottomSheetStateChange', handleBottomSheetChange);
    };
  }, []);

  return (
    <html lang="ko">
      <head>
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className={inter.className}>
        {/* 페이지 구조 */}
        <div className="flex flex-col min-h-screen">
          <div className={`transition-opacity duration-300 ${isBottomSheetFullyOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <Header />
            <SearchBar />
          </div>
          <main className={`flex-grow ${isBottomSheetFullyOpen ? 'pt-0' : 'pt-24'}`}>
            {children}
          </main>
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}