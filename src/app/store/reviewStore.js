// src/store/reviewStore.js
import { create } from 'zustand';
import { 
  getReviewsByPlaceId, 
  getUserReview, 
  addReview, 
  updateReview, 
  deleteReview,
  getTopPlaces
} from '@app/lib/db';
import { uploadReviewImage, deleteImage } from '@app/lib/storage';

// 리뷰 상태 스토어 생성
const useReviewStore = create((set, get) => ({
  // 상태
  reviews: [],             // 현재 선택된 장소의 리뷰 목록
  userReview: null,        // 현재 로그인한 사용자의 원픽 리뷰
  topPlaces: [],           // 인기 장소 목록 (랭킹)
  currentPlaceId: null,    // 현재 선택된 장소 ID
  isLoading: false,        // 로딩 상태
  error: null,             // 오류 메시지
  photoFile: null,         // 업로드할 이미지 파일
  photoPreview: null,      // 이미지 미리보기 URL
  reviewForm: {            // 리뷰 작성/수정 폼 상태
    reviewText: '',
    placeId: '',
    placeName: '',
    placeAddress: '',
    placeLocation: null
  },
  
  // 리뷰 데이터 초기화
  resetState: () => {
    set({
      reviews: [],
      currentPlaceId: null,
      photoFile: null,
      photoPreview: null,
      reviewForm: {
        reviewText: '',
        placeId: '',
        placeName: '',
        placeAddress: '',
        placeLocation: null
      }
    });
  },
  
  // 특정 장소의 리뷰 로드
  loadReviews: async (placeId) => {
    if (!placeId) return [];
    
    try {
      set({ 
        isLoading: true, 
        error: null,
        currentPlaceId: placeId
      });
      
      // Firestore에서 장소별 리뷰 가져오기
      const reviews = await getReviewsByPlaceId(placeId);
      
      set({ 
        reviews,
        isLoading: false
      });
      
      return reviews;
    } catch (error) {
      console.error('리뷰 로드 오류:', error);
      set({ 
        error: '리뷰를 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      });
      return [];
    }
  },
  
  // 사용자 리뷰 로드
  loadUserReview: async (userId) => {
    if (!userId) {
      set({ userReview: null });
      return null;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      // Firestore에서 사용자 리뷰 가져오기
      const userReview = await getUserReview(userId);
      
      set({ 
        userReview,
        isLoading: false
      });
      
      // 사용자 리뷰가 있으면 폼 상태 업데이트
      if (userReview) {
        set({
          reviewForm: {
            reviewText: userReview.reviewText || '',
            placeId: userReview.placeId || '',
            placeName: userReview.placeName || '',
            placeAddress: userReview.placeAddress || '',
            placeLocation: userReview.placeLocation || null
          },
          photoPreview: userReview.photoURL || null
        });
      }
      
      return userReview;
    } catch (error) {
      console.error('사용자 리뷰 로드 오류:', error);
      set({ 
        error: '사용자 리뷰를 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      });
      return null;
    }
  },
  
  // 인기 장소 로드 (랭킹)
  loadTopPlaces: async (limit = 10) => {
    try {
      set({ isLoading: true, error: null });
      
      // Firestore에서 인기 장소 가져오기
      const topPlaces = await getTopPlaces(limit);
      
      set({ 
        topPlaces,
        isLoading: false
      });
      
      return topPlaces;
    } catch (error) {
      console.error('인기 장소 로드 오류:', error);
      set({ 
        error: '인기 장소를 불러오는 중 오류가 발생했습니다.',
        isLoading: false
      });
      return [];
    }
  },
  
  // 이미지 파일 설정
  setPhotoFile: (file) => {
    // 이전 미리보기 URL 해제
    if (get().photoPreview && get().photoPreview.startsWith('blob:')) {
      URL.revokeObjectURL(get().photoPreview);
    }
    
    // 새 파일 및 미리보기 설정
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      set({ 
        photoFile: file,
        photoPreview: previewUrl
      });
    } else {
      set({ 
        photoFile: null,
        photoPreview: null
      });
    }
  },
  
  // 리뷰 폼 상태 업데이트
  updateReviewForm: (field, value) => {
    set(state => ({
      reviewForm: {
        ...state.reviewForm,
        [field]: value
      }
    }));
  },
  
  // 리뷰 폼 상태 설정
  setReviewForm: (formData) => {
    set({ reviewForm: { ...formData } });
  },
  
  // 리뷰 제출 (추가 또는 업데이트)
  submitReview: async (userId) => {
    if (!userId) {
      set({ error: '로그인이 필요합니다.' });
      return false;
    }
    
    const { userReview, reviewForm, photoFile } = get();
    console.log('submitReview 호출 시 reviewForm:', reviewForm); // 디버깅 로그 추가
    
    // 필수 필드 검증
    if (!reviewForm.placeId || !reviewForm.reviewText || !reviewForm.placeName) {
      set({ error: '필수 정보가 누락되었습니다.' });
      return false;
    }
    
    try {
      set({ isLoading: true, error: null });
      
      // 리뷰 데이터 준비
      let photoURL = userReview?.photoURL || null;
      let photoPath = userReview?.photoPath || null;
      
      // 새 이미지 파일이 있으면 업로드
      if (photoFile) {
        // 기존 이미지가 있으면 삭제
        if (photoPath) {
          await deleteImage(photoPath);
        }
        
        // 새 이미지 업로드
        const uploadResult = await uploadReviewImage(photoFile, userId);
        photoURL = uploadResult.url;
        photoPath = uploadResult.path;
      }
      
      // 리뷰 데이터 생성
      const reviewData = {
        userId,
        placeId: reviewForm.placeId,
        placeName: reviewForm.placeName,
        placeAddress: reviewForm.placeAddress,
        placeLocation: reviewForm.placeLocation,
        reviewText: reviewForm.reviewText,
        photoURL,
        photoPath
      };
      
      // 리뷰 추가 또는 업데이트
      let result;
      
      if (userReview) {
        // 기존 리뷰 업데이트
        result = await updateReview(userReview.id, reviewData);
      } else {
        // 새 리뷰 추가
        result = await addReview(reviewData);
      }
      
      if (!result.success) {
        throw new Error(result.error || '리뷰 저장에 실패했습니다.');
      }
      
      // 리뷰 목록 새로고침 (현재 장소의 리뷰를 보고 있는 경우)
      if (get().currentPlaceId === reviewForm.placeId) {
        await get().loadReviews(reviewForm.placeId);
      }
      
      // 사용자 리뷰 새로고침
      await get().loadUserReview(userId);
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('리뷰 제출 오류:', error);
      set({ 
        error: error.message || '리뷰 저장 중 오류가 발생했습니다.',
        isLoading: false
      });
      return false;
    }
  },
  
  // 리뷰 삭제
  deleteReview: async (reviewId) => {
    if (!reviewId) return false;
    
    try {
      set({ isLoading: true, error: null });
      
      // Firestore에서 리뷰 삭제
      const result = await deleteReview(reviewId);
      
      if (!result.success) {
        throw new Error(result.error || '리뷰 삭제에 실패했습니다.');
      }
      
      // 사용자 리뷰가 삭제된 경우
      const { userReview, currentPlaceId } = get();
      
      if (userReview && userReview.id === reviewId) {
        // 이미지가 있으면 스토리지에서 삭제
        if (userReview.photoPath) {
          await deleteImage(userReview.photoPath);
        }
        
        // 사용자 리뷰 상태 초기화
        set({ 
          userReview: null,
          photoFile: null,
          photoPreview: null,
          reviewForm: {
            reviewText: '',
            placeId: '',
            placeName: '',
            placeAddress: '',
            placeLocation: null
          }
        });
      }
      
      // 현재 장소의 리뷰 목록 업데이트
      if (currentPlaceId) {
        await get().loadReviews(currentPlaceId);
      }
      
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      set({ 
        error: error.message || '리뷰 삭제 중 오류가 발생했습니다.',
        isLoading: false
      });
      return false;
    }
  },
  
  // 사용자가 특정 장소에 리뷰를 작성했는지 확인
  hasReviewForPlace: (placeId) => {
    const { userReview } = get();
    return userReview && userReview.placeId === placeId;
  },
  
  // 오류 메시지 초기화
  clearError: () => {
    set({ error: null });
  }
}));

export default useReviewStore;