// src/app/api/reviews/[id]/route.js
import { NextResponse } from 'next/server';
import { updateReview, deleteReview } from '@app/lib/db';
import { getUserData } from '@app/lib/auth';

// 특정 리뷰 가져오기 (GET)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 여기서는 단일 리뷰를 가져오는 함수가 없으므로 구현 필요
    // 예시로 에러 응답을 반환
    return NextResponse.json(
      { error: '아직 구현되지 않은 API입니다.' },
      { status: 501 }
    );
  } catch (error) {
    console.error('리뷰 가져오기 오류:', error);
    return NextResponse.json(
      { error: '리뷰를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 리뷰 업데이트 (PUT)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // 요청 본문 파싱
    const body = await request.json();
    const { userId, reviewText, photoURL, photoPath } = body;

    // 필수 필드 검증
    if (!userId || !reviewText) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
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

    // 리뷰 데이터 준비
    const updatedData = {
      reviewText,
      photoURL: photoURL || null,
      photoPath: photoPath || null
    };

    // 리뷰 업데이트
    const result = await updateReview(id, updatedData);

    if (!result.success) {
      throw new Error(result.error || '리뷰 업데이트에 실패했습니다.');
    }

    return NextResponse.json({ success: true, message: '리뷰가 성공적으로 업데이트되었습니다.' });
  } catch (error) {
    console.error('리뷰 업데이트 오류:', error);
    return NextResponse.json(
      { error: error.message || '리뷰 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 리뷰 삭제 (DELETE)
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!id) {
      return NextResponse.json(
        { error: '리뷰 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '사용자 ID가 필요합니다.' },
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

    // 리뷰 삭제
    const result = await deleteReview(id);

    if (!result.success) {
      throw new Error(result.error || '리뷰 삭제에 실패했습니다.');
    }

    return NextResponse.json({ success: true, message: '리뷰가 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('리뷰 삭제 오류:', error);
    return NextResponse.json(
      { error: error.message || '리뷰 삭제 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}