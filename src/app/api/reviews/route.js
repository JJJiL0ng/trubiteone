// src/app/api/reviews/route.js
import { NextResponse } from 'next/server';
import { getReviewsByPlaceId, getUserReview, addReview } from '@/lib/db';
import { auth } from '@/lib/firebase';
import { getUserData } from '@/lib/auth';

// 리뷰 목록 가져오기 (GET)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('placeId');
    const userId = searchParams.get('userId');

    if (!placeId && !userId) {
      return NextResponse.json(
        { error: 'placeId 또는 userId 파라미터가 필요합니다.' },
        { status: 400 }
      );
    }

    let reviews = [];

    if (placeId) {
      // 특정 장소의 리뷰 가져오기
      reviews = await getReviewsByPlaceId(placeId);
    } else if (userId) {
      // 특정 사용자의 리뷰 가져오기
      const userReview = await getUserReview(userId);
      if (userReview) {
        reviews = [userReview];
      }
    }

    return NextResponse.json({ reviews });
  } catch (error) {
    console.error('리뷰 가져오기 오류:', error);
    return NextResponse.json(
      { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 리뷰 추가하기 (POST)
export async function POST(request) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { userId, placeId, placeName, placeAddress, placeLocation, reviewText, photoURL, photoPath } = body;

    // 필수 필드 검증
    if (!userId || !placeId || !placeName || !reviewText) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }

    // 사용자 인증 확인 (여기서는 서버 측에서 인증을 처리할 수 없으므로 클라이언트에서 전달받은 userId 사용)
    const userData = await getUserData(userId);
    if (!userData) {
      return NextResponse.json(
        { error: '인증되지 않은 사용자입니다.' },
        { status: 401 }
      );
    }

    // 이미 리뷰를 작성했는지 확인
    if (userData.favoritePlaceId) {
      return NextResponse.json(
        { error: '사용자는 이미 원픽 맛집을 등록했습니다.' },
        { status: 400 }
      );
    }

    // 리뷰 데이터 준비
    const reviewData = {
      userId,
      placeId,
      placeName,
      placeAddress: placeAddress || '',
      placeLocation: placeLocation || { lat: 0, lng: 0 },
      reviewText,
      photoURL: photoURL || null,
      photoPath: photoPath || null
    };

    // 리뷰 추가
    const result = await addReview(reviewData);

    if (!result.success) {
      throw new Error(result.error || '리뷰 추가에 실패했습니다.');
    }

    return NextResponse.json({ success: true, message: '리뷰가 성공적으로 추가되었습니다.' });
  } catch (error) {
    console.error('리뷰 추가 오류:', error);
    return NextResponse.json(
      { error: error.message || '리뷰 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}