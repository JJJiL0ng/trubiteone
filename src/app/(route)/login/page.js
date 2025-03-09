'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { FiLock, FiUser, FiThumbsUp } from 'react-icons/fi';
import LoginButton from '@app/components/featureComponents/authComponents/LoginButton';
import useAuth from '@app/hooks/useAuth';

const LoginPage = () => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 이미 로그인한 사용자는 홈페이지로 리다이렉트
    if (isAuthenticated) {
      router.push('/');
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-600 py-6 px-8 text-center">
          <h1 className="text-2xl font-bold text-white">TruBite.one 로그인</h1>
          <p className="text-blue-100 mt-2">신뢰할 수 있는 맛집 리뷰 플랫폼</p>
        </div>
        
        <div className="p-8">
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-800 flex items-center">
                <FiLock className="mr-2" /> 로그인 후 이용 가능한 기능
              </h2>
              <ul className="mt-3 space-y-2 text-gray-700">
                <li className="flex items-start">
                  <FiThumbsUp className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <span>나만의 <strong className="text-blue-600">원픽 맛집</strong>을 등록하고 공유할 수 있습니다.</span>
                </li>
                <li className="flex items-start">
                  <FiUser className="text-blue-500 mt-1 mr-2 flex-shrink-0" />
                  <span>인증된 사용자만 리뷰를 작성할 수 있어 <strong className="text-blue-600">더 신뢰도 높은 정보</strong>를 제공합니다.</span>
                </li>
              </ul>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 mb-4">소셜 계정으로 간편하게 로그인하세요</p>
              <LoginButton className="w-full py-3 text-base" />
            </div>
            
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>로그인하면 TruBite.one의 <a href="/terms" className="text-blue-600 hover:underline">이용약관</a>과 <a href="/privacy" className="text-blue-600 hover:underline">개인정보처리방침</a>에 동의하게 됩니다.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center max-w-md">
        <h3 className="font-medium text-gray-800 mb-3">TruBite.one은 인증된 사용자의 리뷰만 제공합니다</h3>
        <p className="text-gray-600">
          소셜 로그인을 통한 사용자 인증으로 가짜 리뷰를 방지하고, 실제 방문자의 솔직한 평가만을 공유합니다. 
          여러분의 소중한 원픽 맛집을 등록하고 다른 사람들과 진정한 맛집 정보를 나눠보세요.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
