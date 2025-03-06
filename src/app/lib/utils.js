// src/lib/utils.js

// 현재 타임스탬프 반환 (서버 타임스탬프 대체용)
export const getTimestamp = () => {
    return new Date();
  };
  
  // 날짜 포맷팅 함수
  export const formatDate = (date, options = {}) => {
    if (!date) return '';
    
    try {
      // Firebase Timestamp 객체인 경우 변환
      const dateObj = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      
      // 기본 옵션
      const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      
      // 옵션 병합
      const formattedOptions = { ...defaultOptions, ...options };
      
      // 날짜 포맷팅
      return new Intl.DateTimeFormat('ko-KR', formattedOptions).format(dateObj);
    } catch (error) {
      console.error('날짜 포맷팅 오류:', error);
      return '';
    }
  };
  
  // 시간 경과 표시 (예: "3일 전", "방금 전")
  export const timeAgo = (date) => {
    if (!date) return '';
    
    try {
      // Firebase Timestamp 객체인 경우 변환
      const dateObj = typeof date.toDate === 'function' ? date.toDate() : new Date(date);
      const now = new Date();
      const diffInSeconds = Math.floor((now - dateObj) / 1000);
      
      // 시간 단위별 초 환산
      const minute = 60;
      const hour = minute * 60;
      const day = hour * 24;
      const week = day * 7;
      const month = day * 30;
      const year = day * 365;
      
      // 경과 시간 계산 및 포맷팅
      if (diffInSeconds < 30) {
        return '방금 전';
      } else if (diffInSeconds < minute) {
        return `${diffInSeconds}초 전`;
      } else if (diffInSeconds < hour) {
        return `${Math.floor(diffInSeconds / minute)}분 전`;
      } else if (diffInSeconds < day) {
        return `${Math.floor(diffInSeconds / hour)}시간 전`;
      } else if (diffInSeconds < week) {
        return `${Math.floor(diffInSeconds / day)}일 전`;
      } else if (diffInSeconds < month) {
        return `${Math.floor(diffInSeconds / week)}주 전`;
      } else if (diffInSeconds < year) {
        return `${Math.floor(diffInSeconds / month)}개월 전`;
      } else {
        return `${Math.floor(diffInSeconds / year)}년 전`;
      }
    } catch (error) {
      console.error('시간 경과 계산 오류:', error);
      return '';
    }
  };
  
  // 문자열 자르기 (말줄임표 추가)
  export const truncateString = (str, maxLength = 100) => {
    if (!str || str.length <= maxLength) return str;
    return `${str.substring(0, maxLength)}...`;
  };
  
  // 텍스트에서 URL 링크 변환
  export const linkify = (text) => {
    if (!text) return '';
    
    // URL 패턴
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    
    // URL을 링크로 변환
    return text.replace(urlPattern, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
  };
  
  // 문자열의 HTML 이스케이프 처리
  export const escapeHtml = (html) => {
    if (!html) return '';
    
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
  
  // 배열 셔플 (Fisher-Yates 알고리즘)
  export const shuffleArray = (array) => {
    if (!array || !Array.isArray(array)) return [];
    
    const newArray = [...array];
    
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    
    return newArray;
  };
  
  // 브라우저 로컬 스토리지 사용 함수
  export const storage = {
    // 데이터 저장
    set: (key, value) => {
      try {
        if (typeof window === 'undefined') return false;
        
        const serializedValue = JSON.stringify(value);
        localStorage.setItem(key, serializedValue);
        return true;
      } catch (error) {
        console.error('로컬 스토리지 저장 오류:', error);
        return false;
      }
    },
    
    // 데이터 불러오기
    get: (key, defaultValue = null) => {
      try {
        if (typeof window === 'undefined') return defaultValue;
        
        const serializedValue = localStorage.getItem(key);
        if (serializedValue === null) return defaultValue;
        
        return JSON.parse(serializedValue);
      } catch (error) {
        console.error('로컬 스토리지 불러오기 오류:', error);
        return defaultValue;
      }
    },
    
    // 데이터 삭제
    remove: (key) => {
      try {
        if (typeof window === 'undefined') return false;
        
        localStorage.removeItem(key);
        return true;
      } catch (error) {
        console.error('로컬 스토리지 삭제 오류:', error);
        return false;
      }
    },
    
    // 전체 데이터 삭제
    clear: () => {
      try {
        if (typeof window === 'undefined') return false;
        
        localStorage.clear();
        return true;
      } catch (error) {
        console.error('로컬 스토리지 초기화 오류:', error);
        return false;
      }
    }
  };
  
  // 디바운스 함수 (연속 호출 제한)
  export const debounce = (func, wait = 300) => {
    let timeout;
    
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };
  
  // 쓰로틀 함수 (일정 시간 간격으로 실행 제한)
  export const throttle = (func, limit = 300) => {
    let inThrottle;
    
    return function executedFunction(...args) {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  };
  
  // 이미지 파일인지 확인
  export const isImageFile = (file) => {
    if (!file) return false;
    
    // 파일 타입이 image로 시작하는지 확인
    if (file.type && file.type.startsWith('image/')) return true;
    
    // 확장자로 확인 (타입이 없는 경우)
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const extension = file.name?.split('.').pop()?.toLowerCase();
    
    return extension && imageExtensions.includes(extension);
  };
  
  // 파일 크기 포맷팅 (예: 1.5 MB, 340 KB)
  export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // 정규식 검사 함수
  export const validatePattern = {
    // 이메일 유효성 검사
    email: (email) => {
      const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return pattern.test(email);
    },
    
    // URL 유효성 검사
    url: (url) => {
      const pattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      return pattern.test(url);
    },
    
    // 전화번호 유효성 검사 (한국 형식)
    phone: (phone) => {
      const pattern = /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/;
      return pattern.test(phone);
    }
  };
  
  // 유니크 ID 생성
  export const generateId = (prefix = '') => {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substring(2, 9)}`;
  };
  
  // 객체의 빈 값(null, undefined, '', []) 제거
  export const removeEmptyValues = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    
    return Object.fromEntries(
      Object.entries(obj)
        .filter(([_, value]) => {
          if (value === null || value === undefined) return false;
          if (value === '') return false;
          if (Array.isArray(value) && value.length === 0) return false;
          return true;
        })
        .map(([key, value]) => {
          // 중첩 객체 처리
          if (typeof value === 'object' && !Array.isArray(value)) {
            return [key, removeEmptyValues(value)];
          }
          return [key, value];
        })
    );
  };
  
  // 브라우저 환경 감지
  export const isBrowser = typeof window !== 'undefined';
  
  // 모바일 기기 감지
  export const isMobile = () => {
    if (!isBrowser) return false;
    
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };
  
  // 색상 밝기 조정 함수
  export const adjustColorBrightness = (color, amount) => {
    try {
      // 헥스 색상 코드를 RGB로 변환
      let hex = color.replace('#', '');
      
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      
      // RGB 값 조정
      const calcR = Math.max(0, Math.min(255, r + amount));
      const calcG = Math.max(0, Math.min(255, g + amount));
      const calcB = Math.max(0, Math.min(255, b + amount));
      
      // RGB를 헥스 코드로 변환
      return '#' + 
        ((1 << 24) + (calcR << 16) + (calcG << 8) + calcB)
          .toString(16)
          .slice(1);
    } catch (error) {
      console.error('색상 조정 오류:', error);
      return color;
    }
  };