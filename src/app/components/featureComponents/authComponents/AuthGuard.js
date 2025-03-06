// src/components/featureComponents/AuthComponents/AuthGuard.js
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';
import Spinner from '@/app/components/ui/Spinner';

/**
 * 인증 보호 컴포넌트 - 로그인이 필요한 페이지를 감싸는 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @param {string} props.redirectTo - 비로그인 시 리다이렉트할 경로 (기본값: /login)
 * @param {boolean} props.checkFavoritePlace - 원픽 맛집 등록 여부 확인 (기본값: false)
 * @param {boolean} props.redirectIfHasFavorite - 이미 원픽을 등록한 경우 리다이렉트할지 여부 (기본값: false)
 * @param {string} props.redirectFavoriteTo - 원픽 등록 시 리다이렉트할 경로 (기본값: /)
 */
const AuthGuard = ({
  children,
  redirectTo = '/login',
  checkFavoritePlace = false,
  redirectIfHasFavorite = false,
  redirectFavoriteTo = '/'
}) => {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  
  const { isAuthenticated, isLoading, hasFavoritePlace } = useAuth();

  useEffect(() => {
    // 인증 상태 확인이 완료되면
    if (!isLoading) {
      // 로그인되지 않은 경우 리다이렉트
      if (!isAuthenticated) {
        router.push(redirectTo);
        return;
      }
      
      // 원픽 맛집 등록 여부 확인이 필요한 경우
      if (checkFavoritePlace) {
        // 이미 원픽 맛집을 등록했고, 리다이렉트가 필요한 경우
        if (hasFavoritePlace && redirectIfHasFavorite) {
          router.push(redirectFavoriteTo);
          return;
        }
        
        // 원픽 맛집 등록이 필요하고, 아직 등록하지 않은 경우
        if (!hasFavoritePlace && !redirectIfHasFavorite) {
          router.push('/addMyFavorite');
          return;
        }
      }
      
      // 모든 검증이 통과되면 컨텐츠 표시
      setIsChecking(false);
    }
  }, [
    isLoading, 
    isAuthenticated, 
    hasFavoritePlace, 
    checkFavoritePlace, 
    redirectIfHasFavorite, 
    router, 
    redirectTo, 
    redirectFavoriteTo
  ]);

  // 인증 확인 중이거나 로딩 중인 경우 로딩 스피너 표시
  if (isLoading || isChecking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  // 모든 검증이 통과되면 자식 컴포넌트 렌더링
  return <>{children}</>;
};

export default AuthGuard;