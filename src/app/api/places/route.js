// src/app/api/places/route.js
import { NextResponse } from 'next/server';
import { getAllPlaces, getTopPlaces, getPlaceById } from '@/lib/db';
import { searchPlaces, getPlaceDetails } from '@/lib/maps';

// 장소 목록 가져오기 (GET)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const placeId = searchParams.get('id');
    const query = searchParams.get('query');
    const topRanked = searchParams.get('top');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // 특정 장소 ID로 조회
    if (placeId) {
      // Firestore에서 장소 가져오기
      const place = await getPlaceById(placeId);
      
      if (place) {
        return NextResponse.json({ place });
      }
      
      // Firestore에 없으면 Google Places API를 통해 가져오기
      try {
        const googlePlace = await getPlaceDetails(placeId);
        
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
            // 다른 필요한 필드 추가
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
    }
    
    // 검색 쿼리로 조회
    if (query) {
      try {
        const searchResults = await searchPlaces(query);
        const formattedResults = searchResults.map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.formatted_address,
          location: {
            lat: place.geometry?.location.lat(),
            lng: place.geometry?.location.lng()
          }
        }));
        
        return NextResponse.json({ places: formattedResults });
      } catch (error) {
        console.error('장소 검색 오류:', error);
        return NextResponse.json(
          { error: '장소 검색 중 오류가 발생했습니다.' },
          { status: 500 }
        );
      }
    }
    
    // 인기 장소 조회
    if (topRanked === 'true') {
      const places = await getTopPlaces(limit);
      return NextResponse.json({ places });
    }
    
    // 모든 장소 조회
    const places = await getAllPlaces();
    return NextResponse.json({ places });
  } catch (error) {
    console.error('장소 가져오기 오류:', error);
    return NextResponse.json(
      { error: '장소를 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// 새 장소 제안 (POST)
export async function POST(request) {
  try {
    // 요청 본문 파싱
    const body = await request.json();
    const { name, address, location, userId } = body;
    
    // 필수 필드 검증
    if (!name || !address || !location || !userId) {
      return NextResponse.json(
        { error: '필수 필드가 누락되었습니다.' },
        { status: 400 }
      );
    }
    
    // 여기서는 장소 추가 기능이 구현되어 있지 않으므로 예시로 에러 응답 반환
    // 실제로는 장소 데이터 검증 후 저장하는 로직 필요
    
    return NextResponse.json(
      { error: '장소 추가 기능은 아직 구현되지 않았습니다.' },
      { status: 501 }
    );
  } catch (error) {
    console.error('장소 추가 오류:', error);
    return NextResponse.json(
      { error: '장소 추가 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}