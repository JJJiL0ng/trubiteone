// src/lib/storage.js
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// 이미지 업로드 함수
export const uploadImage = async (file, path) => {
  try {
    if (!file) {
      throw new Error('업로드할 파일이 없습니다.');
    }
    
    // 파일 확장자 추출
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // 이미지 파일만 업로드 허용
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error('지원되지 않는 파일 형식입니다. 이미지 파일(jpg, jpeg, png, gif, webp)만 업로드 가능합니다.');
    }
    
    // 파일 크기 제한 (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.');
    }
    
    // 파일 이름에 타임스탬프 추가하여 고유한 이름 생성
    const timestamp = new Date().getTime();
    const uniqueFileName = `${timestamp}_${file.name}`;
    
    // 저장 경로 설정
    const fullPath = path ? `${path}/${uniqueFileName}` : uniqueFileName;
    const storageRef = ref(storage, fullPath);
    
    // 파일 업로드
    const uploadTask = uploadBytesResumable(storageRef, file);
    
    // 업로드 진행 상황과 완료 처리를 위한 Promise 반환
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // 업로드 진행 상황 계산
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`업로드 진행률: ${progress.toFixed(2)}%`);
        },
        (error) => {
          // 업로드 실패 처리
          console.error('업로드 오류:', error);
          reject(error);
        },
        async () => {
          // 업로드 완료 및 다운로드 URL 가져오기
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              path: fullPath
            });
          } catch (error) {
            console.error('다운로드 URL 가져오기 오류:', error);
            reject(error);
          }
        }
      );
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    throw error;
  }
};

// 리뷰 이미지 업로드
export const uploadReviewImage = async (file, userId) => {
  try {
    return await uploadImage(file, `reviews/${userId}`);
  } catch (error) {
    console.error('리뷰 이미지 업로드 오류:', error);
    throw error;
  }
};

// 이미지 삭제 함수
export const deleteImage = async (imagePath) => {
  try {
    if (!imagePath) return;
    
    // 파일 경로가 URL인 경우 처리
    if (imagePath.startsWith('http')) {
      // 기본 이미지인 경우 삭제하지 않음
      if (imagePath.includes('default-restaurant.jpg')) {
        return;
      }
      
      // Firebase 스토리지 URL에서 경로 추출 시도
      try {
        const url = new URL(imagePath);
        const pathMatch = url.pathname.match(/o\/([^?]+)/);
        if (pathMatch && pathMatch[1]) {
          // URL 디코딩하여 실제 경로 추출
          imagePath = decodeURIComponent(pathMatch[1]);
        } else {
          console.warn('이미지 URL에서 경로를 추출할 수 없습니다:', imagePath);
          return;
        }
      } catch (error) {
        console.warn('이미지 URL 파싱 오류:', error);
        return;
      }
    }
    
    const imageRef = ref(storage, imagePath);
    await deleteObject(imageRef);
    console.log('이미지가 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('이미지 삭제 오류:', error);
    // 이미 삭제된 파일이거나 존재하지 않는 파일일 수 있으므로 오류 무시
  }
};

// 이미지 URL이 유효한지 확인하는 함수
export const isValidImageUrl = async (url) => {
  try {
    if (!url || typeof url !== 'string') return false;
    
    // 기본 이미지 URL인 경우 유효함
    if (url.includes('default-restaurant.jpg')) return true;
    
    // 이미지 URL이 Firebase Storage URL인지 확인
    if (!url.startsWith('https://firebasestorage.googleapis.com')) return false;
    
    // HEAD 요청으로 URL 유효성 확인
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('이미지 URL 유효성 확인 오류:', error);
    return false;
  }
};