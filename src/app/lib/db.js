// src/lib/db.js
import { 
    collection, 
    doc, 
    getDoc, 
    getDocs, 
    setDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit, 
    serverTimestamp, 
    increment,
    runTransaction
  } from 'firebase/firestore';
  import { db } from './firebase';
  
  // === 리뷰 관련 함수 ===
  
  // 특정 장소의 모든 리뷰 가져오기
  export const getReviewsByPlaceId = async (placeId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('placeId', '==', placeId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const reviews = [];
      
      querySnapshot.forEach((doc) => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return reviews;
    } catch (error) {
      console.error('리뷰 가져오기 오류:', error);
      return [];
    }
  };
  
  // 특정 사용자의 리뷰 가져오기
  export const getUserReview = async (userId) => {
    try {
      const q = query(
        collection(db, 'reviews'),
        where('userId', '==', userId),
        limit(1)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }
      
      const reviewDoc = querySnapshot.docs[0];
      return {
        id: reviewDoc.id,
        ...reviewDoc.data()
      };
    } catch (error) {
      console.error('사용자 리뷰 가져오기 오류:', error);
      return null;
    }
  };
  
  // 리뷰 추가하기
  export const addReview = async (reviewData) => {
    try {
      // 트랜잭션 사용하여 원자적으로 처리
      await runTransaction(db, async (transaction) => {
        // 1. 사용자가 이미 다른 리뷰를 작성했는지 확인
        const userRef = doc(db, 'users', reviewData.userId);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          throw new Error('사용자가 존재하지 않습니다.');
        }
        
        const userData = userDoc.data();
        if (userData.favoritePlaceId) {
          throw new Error('사용자는 이미 원픽 맛집을 등록했습니다.');
        }
        
        // 2. 리뷰 추가
        const reviewRef = doc(collection(db, 'reviews'));
        
        // 리뷰 데이터 준비
        const newReview = {
          ...reviewData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        transaction.set(reviewRef, newReview);
        
        // 3. 장소 문서 업데이트 또는 생성
        const placeRef = doc(db, 'places', reviewData.placeId);
        const placeDoc = await transaction.get(placeRef);
        
        if (placeDoc.exists()) {
          // 기존 장소 업데이트
          transaction.update(placeRef, {
            reviewCount: increment(1),
            reviewIds: [...placeDoc.data().reviewIds, reviewRef.id],
            updatedAt: serverTimestamp()
          });
        } else {
          // 새 장소 생성
          transaction.set(placeRef, {
            name: reviewData.placeName,
            address: reviewData.placeAddress,
            location: reviewData.placeLocation,
            reviewCount: 1,
            reviewIds: [reviewRef.id],
            updatedAt: serverTimestamp()
          });
        }
        
        // 4. 사용자 문서 업데이트
        transaction.update(userRef, {
          favoritePlaceId: reviewData.placeId
        });
        
        return reviewRef.id;
      });
      
      return { success: true };
    } catch (error) {
      console.error('리뷰 추가 오류:', error);
      return { success: false, error: error.message };
    }
  };
  
  // 리뷰 업데이트하기
  export const updateReview = async (reviewId, updatedData) => {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        ...updatedData,
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('리뷰 업데이트 오류:', error);
      return { success: false, error: error.message };
    }
  };
  
  // 리뷰 삭제하기 (트랜잭션 사용)
  export const deleteReview = async (reviewId) => {
    try {
      await runTransaction(db, async (transaction) => {
        // 1. 리뷰 데이터 가져오기
        const reviewRef = doc(db, 'reviews', reviewId);
        const reviewDoc = await transaction.get(reviewRef);
        
        if (!reviewDoc.exists()) {
          throw new Error('리뷰가 존재하지 않습니다.');
        }
        
        const reviewData = reviewDoc.data();
        
        // 2. 사용자 문서 업데이트
        const userRef = doc(db, 'users', reviewData.userId);
        transaction.update(userRef, {
          favoritePlaceId: null
        });
        
        // 3. 장소 문서 업데이트
        const placeRef = doc(db, 'places', reviewData.placeId);
        const placeDoc = await transaction.get(placeRef);
        
        if (placeDoc.exists()) {
          const placeData = placeDoc.data();
          
          // reviewIds 배열에서 현재 리뷰 ID 제거
          const updatedReviewIds = placeData.reviewIds.filter(id => id !== reviewId);
          
          if (updatedReviewIds.length === 0) {
            // 리뷰가 없으면 장소 문서 삭제
            transaction.delete(placeRef);
          } else {
            // 리뷰 카운트 감소 및 reviewIds 업데이트
            transaction.update(placeRef, {
              reviewCount: increment(-1),
              reviewIds: updatedReviewIds,
              updatedAt: serverTimestamp()
            });
          }
        }
        
        // 4. 리뷰 삭제
        transaction.delete(reviewRef);
      });
      
      return { success: true };
    } catch (error) {
      console.error('리뷰 삭제 오류:', error);
      return { success: false, error: error.message };
    }
  };
  
  // === 장소 관련 함수 ===
  
  // 모든 장소 가져오기
  export const getAllPlaces = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'places'));
      const places = [];
      
      querySnapshot.forEach((doc) => {
        places.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return places;
    } catch (error) {
      console.error('장소 가져오기 오류:', error);
      return [];
    }
  };
  
  // 인기 장소 가져오기 (리뷰 수 기준)
  export const getTopPlaces = async (limitCount = 10) => {
    try {
      const q = query(
        collection(db, 'places'),
        orderBy('reviewCount', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const places = [];
      
      querySnapshot.forEach((doc) => {
        places.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return places;
    } catch (error) {
      console.error('인기 장소 가져오기 오류:', error);
      return [];
    }
  };
  
  // 특정 장소 정보 가져오기
  export const getPlaceById = async (placeId) => {
    try {
      const placeDoc = await getDoc(doc(db, 'places', placeId));
      
      if (placeDoc.exists()) {
        return {
          id: placeDoc.id,
          ...placeDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('장소 정보 가져오기 오류:', error);
      return null;
    }
  };