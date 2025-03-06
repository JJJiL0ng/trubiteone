// src/store/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithGoogle, 
  logOut,
  getUserData,
  observeAuthState
} from '@app/lib/auth';

// 인증 상태 스토어 생성
const useAuthStore = create(
  persist(
    (set, get) => ({
      // 상태
      user: null,       // Firebase Auth 사용자 객체
      userData: null,   // Firestore에서 가져온 사용자 데이터
      isLoading: true,  // 인증 상태 로딩 중
      error: null,      // 오류 메시지
      
      // 로그인 상태 초기화 및 관찰 시작
      initAuth: () => {
        // 이미 관찰 중이면 중복 실행 방지
        if (get().unsubscribe) return;
        
        // 인증 상태 관찰 시작
        const unsubscribe = observeAuthState(({ user, userData }) => {
          set({
            user,
            userData,
            isLoading: false,
            error: null
          });
        });
        
        // 구독 해제 함수 저장
        set({ unsubscribe });
      },
      
      // 관찰 중지
      cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
          unsubscribe();
          set({ unsubscribe: null });
        }
      },
      
      // Google 로그인 처리
      login: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const result = await signInWithGoogle();
          
          if (!result.success) {
            throw new Error(result.error || '로그인에 실패했습니다.');
          }
          
          // 로그인 성공 시 사용자 데이터는 observeAuthState에서 자동으로 설정됨
          return true;
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false
          });
          return false;
        }
      },
      
      // 로그아웃 처리
      logout: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const result = await logOut();
          
          if (!result.success) {
            throw new Error(result.error || '로그아웃에 실패했습니다.');
          }
          
          // 로그아웃 성공 시 사용자 데이터 초기화
          set({ 
            user: null,
            userData: null,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false
          });
          return false;
        }
      },
      
      // 사용자 데이터 새로고침
      refreshUserData: async () => {
        const { user } = get();
        
        if (!user) return false;
        
        try {
          set({ isLoading: true, error: null });
          
          const userData = await getUserData(user.uid);
          
          set({ 
            userData,
            isLoading: false
          });
          
          return true;
        } catch (error) {
          set({ 
            error: error.message,
            isLoading: false
          });
          return false;
        }
      },
      
      // 로그인 여부 확인
      isLoggedIn: () => {
        return !!get().user;
      },
      
      // 원픽 맛집을 등록했는지 확인
      hasFavoritePlace: () => {
        const { userData } = get();
        return userData && !!userData.favoritePlaceId;
      },
      
      // 오류 메시지 초기화
      clearError: () => {
        set({ error: null });
      },
      
      // 구독 해제 함수
      unsubscribe: null
    }),
    {
      name: 'auth-storage', // 로컬 스토리지 키
      partialize: (state) => ({ 
        // 민감한 데이터는 영구 저장하지 않음
        user: state.user ? {
          uid: state.user.uid,
          email: state.user.email,
          displayName: state.user.displayName,
          photoURL: state.user.photoURL
        } : null
      })
    }
  )
);

export default useAuthStore;