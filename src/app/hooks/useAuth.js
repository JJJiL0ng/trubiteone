// src/hooks/useAuth.js
import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@app/store/authStore';

/**
 * 인증 관련 기능을 제공하는 커스텀 훅
 * @param {Object} options - 옵션 객체
 * @param {boolean} options.requireAuth - 인증이 필요한지 여부 (기본값: false)
 * @param {string} options.redirectTo - 인증이 필요하지만 로그인되지 않은 경우 리다이렉트할 경로
 * @param {boolean} options.redirectIfFound - 인증된 사용자를 리다이렉트할지 여부
 * @returns {Object} 인증 관련 상태 및 함수
 */
const useAuth = (options = {}) => {
  const router = useRouter();
  const {
    requireAuth = false,
    redirectTo = '/login',
    redirectIfFound = false
  } = options;

  // authStore에서 필요한 상태와 함수 가져오기
  const { 
    user, 
    userData, 
    isLoading, 
    error, 
    login, 
    logout, 
    initAuth, 
    refreshUserData, 
    clearError, 
    isLoggedIn, 
    hasFavoritePlace 
  } = useAuthStore();

  // 로그인 함수
  const handleLogin = useCallback(async () => {
    const success = await login();
    return success;
  }, [login]);

  // 로그아웃 함수
  const handleLogout = useCallback(async () => {
    const success = await logout();
    if (success) {
      // 로그인 페이지로 리다이렉트
      router.push('/login');
    }
    return success;
  }, [logout, router]);

  // 인증 상태 초기화
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  // 리다이렉트 로직
  useEffect(() => {
    if (isLoading) return;

    if (requireAuth && !user) {
      // 인증이 필요하지만 로그인되지 않은 경우
      router.push(redirectTo);
    } else if (redirectIfFound && user) {
      // 이미 로그인되어 있고, redirectIfFound가 true인 경우
      router.push('/');
    }
  }, [user, isLoading, requireAuth, redirectIfFound, redirectTo, router]);

  // 사용자가 원픽 맛집을 등록했는지 여부를 확인하는 함수
  const checkHasFavoritePlace = useCallback(() => {
    const hasPlace = hasFavoritePlace();
    
    if (hasFavoritePlace() && options.redirectIfHasFavorite) {
      // 이미 원픽 맛집을 등록했고, 리다이렉트 옵션이 있는 경우
      router.push(options.redirectIfHasFavorite);
    }
    
    return hasPlace;
  }, [hasFavoritePlace, options, router]);

  return {
    user,
    userData,
    isLoading,
    error,
    isAuthenticated: isLoggedIn(),
    hasFavoritePlace: hasFavoritePlace(),
    login: handleLogin,
    logout: handleLogout,
    refreshUserData,
    clearError,
    checkHasFavoritePlace
  };
};

export default useAuth;