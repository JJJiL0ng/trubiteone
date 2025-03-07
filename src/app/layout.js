// src/app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@app/components/layoutComponents/Header';
import Footer from '@app/components/layoutComponents/Footer';
import Navigation from '@app/components/layoutComponents/Navigation';
import Script from 'next/script';

// 폰트 설정
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: '원픽맛집 - 당신만의 단 하나의 맛집을 공유하세요',
  description: '한 사람당 하나의 음식점만 추천하는 글로벌 맛집 플랫폼입니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* Google Maps API 스크립트 */}
        <Script
          src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&callback=Function.prototype`}
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        {/* 페이지 구조 */}
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow pt-16">
            {children}
          </main>
          <Footer />
          <Navigation />
        </div>
      </body>
    </html>
  );
}