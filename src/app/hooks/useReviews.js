// src/hooks/useReviews.js
import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useReviewStore from '@app/store/reviewStore';
import useAuth from '@app/hooks/useAuth';

/**
 * 리뷰 관련 기능을 제공하는 커스텀 훅
 * @param {Object} options - 옵션 객체
 * @param {string} options.placeId - 장소 ID (특정 장소의 리뷰를 로드할 때 사용)
 * @param {boolean} options.loadUserReview - 사용자 리뷰를 로드할지 여부 (기본값: false)
 * @returns {Object} 리뷰 관련 상태 및 함수
 */
const useReviews = (options = {}) => {
  const { placeId, loadUserReview = false } = options;
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // reviewStore에서 필요한 상태와 함수 가져오기
  const {
    reviews,
    userReview,
    topPlaces,
    isLoading,
    error,
    photoFile,
    photoPreview,
    reviewForm,
    loadReviews: loadReviewsFromStore,
    loadUserReview: loadUserReviewFromStore,
    loadTopPlaces: loadTopPlacesFromStore,
    submitReview: submitReviewFromStore,
    deleteReview: deleteReviewFromStore,
    setPhotoFile,
    updateReviewForm,
    setReviewForm,
    resetState,
    clearError
  } = useReviewStore();

  // 특정 장소의 리뷰 로드
  const loadReviews = useCallback(async (id = placeId) => {
    if (!id) return [];
    
    const loadedReviews = await loadReviewsFromStore(id);
    return loadedReviews;
  }, [placeId, loadReviewsFromStore]);

  // 사용자 리뷰 로드
  const getUserReview = useCallback(async () => {
    if (!isAuthenticated || !user) return null;
    
    const userReviewData = await loadUserReviewFromStore(user.uid);
    return userReviewData;
  }, [isAuthenticated, user, loadUserReviewFromStore]);

  // 인기 장소 로드
  const loadTopPlaces = useCallback(async (limit = 10) => {
    const topPlacesData = await loadTopPlacesFromStore(limit);
    return topPlacesData;
  }, [loadTopPlacesFromStore]);

  // 리뷰 제출 (추가 또는 업데이트)
  const submitReview = useCallback(async () => {
    if (!isAuthenticated || !user) {
      router.push('/login');
      return false;
    }
    
    const success = await submitReviewFromStore(user.uid);
    
    if (success) {
      // 리뷰 제출 후 홈페이지로 리다이렉트
      router.push('/');
    }
    
    return success;
  }, [isAuthenticated, user, submitReviewFromStore, router]);

  // 리뷰 삭제
  const deleteReview = useCallback(async (reviewId) => {
    if (!reviewId && userReview) {
      reviewId = userReview.id;
    }
    
    if (!reviewId) return false;
    
    const success = await deleteReviewFromStore(reviewId);
    
    if (success) {
      // 리뷰 삭제 후 홈페이지로 리다이렉트
      router.push('/');
    }
    
    return success;
  }, [userReview, deleteReviewFromStore, router]);

  // 이미지 선택 핸들러
  const handleImageSelect = useCallback((file) => {
    setPhotoFile(file);
  }, [setPhotoFile]);

  // 이미지 제거 핸들러
  const handleImageRemove = useCallback(() => {
    setPhotoFile(null);
  }, [setPhotoFile]);

  // 리뷰 폼 입력 핸들러
  const handleReviewChange = useCallback((field, value) => {
    updateReviewForm(field, value);
  }, [updateReviewForm]);

  // 장소 정보 설정
  const setPlaceInfo = useCallback((place) => {
    if (!place) return;
    
    console.log('setPlaceInfo 호출됨:', place); // 디버깅용 로그 추가
    
    // 함수형 업데이트를 사용하여 최신 상태를 보장
    setReviewForm(prevForm => {
      const newForm = {
        ...prevForm,
        placeId: place.id,
        placeName: place.name,
        placeAddress: place.address || '',
        placeLocation: place.location
      };
      console.log('업데이트된 reviewForm:', newForm); // 디버깅용 로그 추가
      return newForm;
    });
  }, [setReviewForm]);

  // 장소 ID에 해당하는 리뷰 자동 로드
  useEffect(() => {
    if (placeId) {
      loadReviews();
    }
  }, [placeId, loadReviews]);

  // 사용자 리뷰 자동 로드
  useEffect(() => {
    if (loadUserReview && isAuthenticated && user) {
      getUserReview();
    }
  }, [loadUserReview, isAuthenticated, user, getUserReview]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      // 다른 페이지로 이동 시 오류 메시지 초기화
      clearError();
    };
  }, [clearError]);

  return {
    reviews,
    userReview,
    topPlaces,
    isLoading,
    error,
    photoFile,
    photoPreview,
    reviewForm,
    loadReviews,
    getUserReview,
    loadTopPlaces,
    submitReview,
    deleteReview,
    handleImageSelect,
    handleImageRemove,
    handleReviewChange,
    setPlaceInfo,
    resetState,
    clearError
  };
};

export default useReviews;