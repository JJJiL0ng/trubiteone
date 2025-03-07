// src/app/api/places/[id]/route.js
import { NextResponse } from 'next/server';
import { getPlaceById } from '@/lib/db';
import { getPlaceDetails } from '@/lib/maps';

// 특정 장소 정보 가져오기 (GET)
export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: '장소 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // Firestore에서 장소 가져오기
    const place = await getPlaceById(id);
    
    if (place) {
      return NextResponse.json({ place });
    }
    
    // Firestore에 없으면 Google Places API를 통해 가져오기
    try {
      const googlePlace = await getPlaceDetails(id);
      
      if (googlePlace) {
        // Google API 응답을 필요한 포맷으로 변환
        const formattedPlace = {
          id: googlePlace.place_id,
          name: googlePlace.name,
          address: googlePlace.formatted_address,
          location: {
            lat: googlePlace.geometry?.location.lat(),
            lng: googlePlace.geometry?.location.lng()
          },
          // 추가 정보
          phoneNumber: googlePlace.formatted_phone_number || '',
          website: googlePlace.website || '',
          types: googlePlace.types || [],
          reviewCount: 0,
          reviewIds: []
        };
        
        return NextResponse.json({ place: formattedPlace });
      }
    } catch (error) {
      console.error('Google Places API 오류:', error);
    }
    
    return NextResponse.json(
      { error: '해당 장소를 찾을 수 없습니다.' },
      { status: 404 }
    );
  } catch (error) {
    console.error('장소 가져오기 오류:', error);
    return NextResponse.json(
      { error: '장소를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장소 정보 업데이트 (PUT)
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { error: '장소 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    // 요청 본문 파싱
    const body = await request.json();
    
    // 여기서는 장소 업데이트 기능이 구현되어 있지 않으므로 예시로 에러 응답 반환
    // 실제로는 장소 데이터 업데이트 로직 필요
    
    return NextResponse.json(
      { error: '장소 업데이트 기능은 아직 구현되지 않았습니다.' },
      { status: 501 }
    );
  } catch (error) {
    console.error('장소 업데이트 오류:', error);
    return NextResponse.json(
      { error: '장소 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 장소에 대한 리뷰 가져오기 (GET)
export async function PATCH(request, { params }) {
  try {
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (!id) {
      return NextResponse.json(
        { error: '장소 ID가 필요합니다.' },
        { status: 400 }
      );
    }
    
    if (action === 'reviews') {
      // 특정 장소의 리뷰를 가져오는 로직
      // 이미 /api/reviews?placeId=xxx 엔드포인트에서 처리하므로 리다이렉트
      return NextResponse.redirect(new URL(`/api/reviews?placeId=${id}`, request.url));
    }
    
    // 지원하지 않는 액션
    return NextResponse.json(
      { error: '지원하지 않는 액션입니다.' },
      { status: 400 }
    );
  } catch (error) {
    console.error('장소 요청 처리 오류:', error);
    return NextResponse.json(
      { error: '요청 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}