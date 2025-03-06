// src/lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 설정
// 실제 프로젝트에서는 이 값들을 .env.local 파일에서 불러와야 합니다
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Firebase 앱 초기화 (클라이언트 측에서만 초기화)
const app = typeof window !== 'undefined' ? initializeApp(firebaseConfig) : null;

// Firebase 서비스 초기화
const auth = typeof window !== 'undefined' ? getAuth(app) : null;
const db = typeof window !== 'undefined' ? getFirestore(app) : null;
const storage = typeof window !== 'undefined' ? getStorage(app) : null;

export { app, auth, db, storage };