// src/lib/auth.js
import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
  } from 'firebase/auth';
  import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
  import { auth, db } from '@app/lib/firebase';
  
  // Google 로그인
  export const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // 사용자 정보를 Firestore에 저장
      await updateUserProfile(user);
      
      return { success: true, user };
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      return { success: false, error: error.message };
    }
  };
  
  // 로그아웃
  export const logOut = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch (error) {
      console.error('로그아웃 오류:', error);
      return { success: false, error: error.message };
    }
  };
  
  // 사용자 인증 상태 관찰
  export const observeAuthState = (callback) => {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 사용자 정보 가져오기
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        
        callback({ user, userData });
      } else {
        callback({ user: null, userData: null });
      }
    });
  };
  
  // 사용자 프로필 업데이트
  export const updateUserProfile = async (user) => {
    if (!user) return;
    
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      // 기존 사용자의 경우 로그인 시간만 업데이트
      await setDoc(userRef, {
        lastLoginAt: serverTimestamp()
      }, { merge: true });
    } else {
      // 새 사용자의 경우 전체 프로필 생성
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || '',
        favoritePlaceId: null,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });
    }
  };
  
  // 현재 사용자 가져오기
  export const getCurrentUser = () => {
    return auth.currentUser;
  };
  
  // 사용자 데이터 가져오기
  export const getUserData = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('사용자 데이터 가져오기 오류:', error);
      return null;
    }
  };
  
  // 사용자의 원픽 맛집 ID 확인
  export const getUserFavoritePlaceId = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data().favoritePlaceId;
      }
      return null;
    } catch (error) {
      console.error('원픽 맛집 ID 가져오기 오류:', error);
      return null;
    }
  };