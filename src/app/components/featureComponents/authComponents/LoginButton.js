// src/components/featureComponents/AuthComponents/LoginButton.js
'use client';

import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { FiLogIn, FiLogOut } from 'react-icons/fi';
import useAuth from '@app/hooks/useAuth';

/**
 * 구글 로그인/로그아웃 버튼 컴포넌트
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.className - 추가 CSS 클래스
 */
const LoginButton = ({ className = '' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, isAuthenticated, login, logout } = useAuth();

  // 로그인 처리
  const handleLogin = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error('로그인 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      await logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 로그인 상태에 따라 다른 버튼 표시
  if (isAuthenticated) {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors ${
          isLoading ? 'opacity-70 cursor-not-allowed' : ''
        } ${className}`}
      >
        <FiLogOut className="text-lg" />
        <span>로그아웃</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogin}
      disabled={isLoading}
      className={`flex items-center justify-center gap-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 py-2 px-4 rounded shadow transition-colors ${
        isLoading ? 'opacity-70 cursor-not-allowed' : ''
      } ${className}`}
    >
      {isLoading ? (
        <div className="animate-spin h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full" />
      ) : (
        <>
          <FcGoogle className="text-xl" />
          <span>Google로 시작하기</span>
        </>
      )}
    </button>
  );
};

export default LoginButton;