// src/app/api/upload/route.js
import { NextResponse } from 'next/server';
import { uploadReviewImage } from '@app/lib/storage';
import { getUserData } from '@app/lib/auth';

// 파일 크기 제한 (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// 이미지 업로드 처리 (POST)
export async function POST(request) {
  try {
    // 멀티파트 폼 데이터 요청 처리
    const formData = await request.formData();
    const userId = formData.get('userId');
    const file = formData.get('file');
    
    // 필수 필드 검증
    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 사용자 인증 확인
    const userData = await getUserData(userId);
    if (!userData) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }
    
    // 파일 타입 검증
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: '지원되지 않는 파일 형식입니다. JPEG, PNG, GIF, WEBP 형식만 지원합니다.' },
        { status: 400 }
      );
    }
    
    // 파일 크기 검증
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일 크기가 너무 큽니다. 최대 5MB까지 업로드 가능합니다.' },
        { status: 400 }
      );
    }
    
    // 이미지 업로드
    const uploadResult = await uploadReviewImage(file, userId);
    
    return NextResponse.json({
      success: true,
      url: uploadResult.url,
      path: uploadResult.path
    });
  } catch (error) {
    console.error('이미지 업로드 오류:', error);
    return NextResponse.json(
      { error: error.message || '이미지 업로드 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}