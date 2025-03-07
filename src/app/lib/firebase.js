// // src/lib/firebase.js
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// // Firebase 설정
// // 실제 프로젝트에서는 이 값들을 .env.local 파일에서 불러와야 합니다
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

// // Firebase 앱 초기화 (클라이언트 측에서만 초기화)
// const app = typeof window !== 'undefined' ? initializeApp(firebaseConfig) : null;

// // Firebase 서비스 초기화
// const auth = typeof window !== 'undefined' ? getAuth(app) : null;
// const db = typeof window !== 'undefined' ? getFirestore(app) : null;
// const storage = typeof window !== 'undefined' ? getStorage(app) : null;

// export { app, auth, db, storage };

// import { initializeApp, getApps } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// // Firebase 설정
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
// };

// // Firebase 앱 초기화 - 클라이언트 측에서만 실행
// let app, auth, db, storage;

// // 클라이언트 측에서만 Firebase 초기화
// if (typeof window !== 'undefined') {
//   // 앱이 이미 초기화되었는지 확인
//   const apps = getApps();
//   app = apps.length ? apps[0] : initializeApp(firebaseConfig);
//   auth = getAuth(app);
//   db = getFirestore(app);
//   storage = getStorage(app);
// }

// export { app, auth, db, storage };


import { initializeApp, getApps } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase 앱 초기화 - 클라이언트 측에서만 실행
let app, auth, db, storage;

// 클라이언트 측에서만 Firebase 초기화
if (typeof window !== 'undefined') {
  try {
    // 앱이 이미 초기화되었는지 확인
    const apps = getApps();
    app = apps.length ? apps[0] : initializeApp(firebaseConfig);
    
    // 서비스 초기화
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    
    // 개발 환경에서 Firebase 에뮬레이터 연결 (필요한 경우)
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099');
      connectFirestoreEmulator(db, 'localhost', 8080);
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    console.log('Firebase 초기화 성공');
  } catch (error) {
    console.error('Firebase 초기화 오류:', error);
  }
}

export { app, auth, db, storage };