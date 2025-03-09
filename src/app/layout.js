import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@app/components/layoutComponents/Header';
import SearchBar from '@app/components/layoutComponents/SearchBar';
import Script from 'next/script';

// 폰트 설정
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'trubte.one - 당신만의 단 하나의 맛집을 공유하세요',
  description: '한 사람당 하나의 인생 음식점만 추천하는 글로벌 맛집 플랫폼입니다.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        {/* 페이지 구조 */}
        <div className="flex flex-col min-h-screen">
          <Header />
          <SearchBar />
          <main className="flex-grow pt-24">
            {children}
          </main>
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}