다음은 새로운 Claude 채팅에서 개발을 이어가기 위한 프롬프트입니다:

```
나는 Next.js 15.1.6, Firebase, Google 소셜로그인, Google Maps API를 사용하여 원픽 맛집 리뷰 서비스를 개발 중입니다. 이 서비스는 1인당 단 하나의 음식점만 선택해서 리뷰를 남길 수 있는 글로벌 식당 리뷰 플랫폼입니다.

### 프로젝트 요구사항
1. 홈페이지(/)에서는 지도가 표시되고 모든 유저들의 원픽 맛집이 마커로 표시됩니다. 장소 검색도 가능하며, 마커 클릭 시 해당 장소의 리뷰 페이지로 이동합니다.
2. 원픽 맛집 추가 페이지(/addMyFavorite)에서는 로그인 상태 확인 후, 사용자가 맛집을 추가할 수 있습니다. 이미 리뷰를 작성한 사용자는 추가 리뷰를 작성할 수 없습니다.
3. 로그인 페이지(/login)에서는 구글 소셜 로그인을 구현합니다.
4. 랭킹 페이지(/rank)에서는 많이 선택된 맛집을 내림차순으로 표시합니다.
5. 리뷰 페이지(/reviews/[placeId])에서는 특정 장소의 리뷰를 볼 수 있습니다.

### 기술 스택
- Next.js 15.1.6 (App Router)
- JavaScript (TypeScript 사용 안 함)
- Firebase (Authentication, Firestore, Storage)
- Google Maps JavaScript API, Places API
- Tailwind CSS
- Zustand (상태 관리)
- SWR/React Query (데이터 페칭)

### 파일 구조
```
my-food-review-app/
├── .env.local                        # 환경변수 (API 키 등)
├── next.config.js                    # Next.js 설정
├── tailwind.config.js                # Tailwind CSS 설정
├── postcss.config.js                 # PostCSS 설정
├── jsconfig.json                     # JavaScript 경로 설정
├── package.json                      # 프로젝트 의존성
├── public/                           # 정적 파일
│   ├── favicon.ico
│   └── images/
│       └── default-restaurant.jpg    # 기본 음식점 이미지
├── src/
    ├── app/                          # Next.js App Router
    │   ├── layout.js                 # 루트 레이아웃
    │   ├── page.js                   # 홈페이지 (/)
    │   ├── addMyFavorite/
    │   │   └── page.js               # 원픽 맛집 추가 페이지
    │   ├── login/
    │   │   └── page.js               # 로그인 페이지
    │   ├── rank/
    │   │   └── page.js               # 랭킹 페이지
    │   ├── reviews/
    │   │   ├── page.js               # 리뷰 리스트 페이지
    │   │   └── [placeId]/
    │   │       └── page.js           # 특정 장소 리뷰 페이지
    │   └── api/                      # API 라우트
    │       ├── reviews/
    │       │   ├── route.js          # 리뷰 API
    │       │   └── [id]/
    │       │       └── route.js      # 특정 리뷰 API
    │       └── places/
    │           └── route.js          # 장소 API
    ├── components/
    │   ├── ui/                       # 재사용 가능한 UI 컴포넌트
    │   │   ├── Button.js             # 버튼 컴포넌트
    │   │   ├── Input.js              # 입력 필드 컴포넌트
    │   │   ├── Modal.js              # 모달 컴포넌트
    │   │   ├── Spinner.js            # 로딩 스피너
    │   │   └── ErrorMessage.js       # 에러 메시지 표시
    │   ├── layout/                   # 레이아웃 관련 컴포넌트
    │   │   ├── Header.js             # 헤더 컴포넌트
    │   │   ├── Footer.js             # 푸터 컴포넌트
    │   │   └── Navigation.js         # 네비게이션 컴포넌트
    │   ├── map/                      # 지도 관련 컴포넌트
    │   │   ├── Map.js                # 구글 맵 컴포넌트
    │   │   ├── Marker.js             # 지도 마커 컴포넌트
    │   │   ├── PlaceSearch.js        # 장소 검색 컴포넌트
    │   │   └── MarkerCluster.js      # 마커 클러스터링 컴포넌트
    │   ├── review/                   # 리뷰 관련 컴포넌트
    │   │   ├── ReviewForm.js         # 리뷰 작성 폼
    │   │   ├── ReviewItem.js         # 단일 리뷰 아이템
    │   │   ├── ReviewList.js         # 리뷰 목록
    │   │   └── PhotoUpload.js        # 사진 업로드 컴포넌트
    │   └── auth/                     # 인증 관련 컴포넌트
    │       ├── LoginButton.js        # 로그인 버튼
    │       └── AuthGuard.js          # 인증 가드 컴포넌트
    ├── hooks/                        # 커스텀 훅
    │   ├── useAuth.js                # 인증 상태 관리 훅
    │   ├── useMap.js                 # 지도 관련 기능 훅
    │   ├── useReviews.js             # 리뷰 데이터 관리 훅
    │   └── usePlaces.js              # 장소 데이터 관리 훅
    ├── lib/                          # 유틸리티 함수 및 라이브러리
    │   ├── firebase.js               # Firebase 초기화
    │   ├── auth.js                   # 인증 관련 함수
    │   ├── db.js                     # 데이터베이스 관련 함수
    │   ├── storage.js                # Firebase Storage 관련 함수
    │   ├── maps.js                   # Google Maps 관련 함수
    │   └── utils.js                  # 일반 유틸리티 함수
    └── store/                        # 클라이언트 상태 관리
        ├── authStore.js              # 인증 상태 관리 (Zustand)
        ├── mapStore.js               # 지도 상태 관리 (Zustand)
        └── reviewStore.js            # 리뷰 상태 관리 (Zustand)
```

### 데이터 모델

1. **Users 컬렉션**
```
users/
  {userId}/
    email: string
    displayName: string
    photoURL: string
    favoritePlaceId: string (or null)
    createdAt: timestamp
    lastLoginAt: timestamp
```

2. **Reviews 컬렉션**
```
reviews/
  {reviewId}/
    userId: string
    placeId: string
    placeName: string
    placeAddress: string
    placeLocation: {lat: number, lng: number}
    photoURL: string
    reviewText: string
    createdAt: timestamp
    updatedAt: timestamp
```

3. **Places 컬렉션**
```
places/
  {placeId}/
    name: string
    address: string
    location: {lat: number, lng: number}
    reviewCount: number
    reviewIds: array<string>
    updatedAt: timestamp
```

### 개발 순서
1. **기본 설정 및 초기화**
   - 프로젝트 생성 및 종속성 설치
   - 환경 설정 파일 구성
   - Firebase 초기화

2. **코어 라이브러리 개발**
   - 인증 관련 함수 (auth.js)
   - 데이터베이스 관련 함수 (db.js)
   - 스토리지 관련 함수 (storage.js)
   - 지도 관련 유틸리티 (maps.js)

3. **상태 관리 및 커스텀 훅**
   - 상태 저장소 구현 (authStore.js, mapStore.js, reviewStore.js)
   - 커스텀 훅 개발 (useAuth.js, useMap.js, useReviews.js, usePlaces.js)

4. **기본 UI 컴포넌트 개발** (최소 스타일링)
   - 공통 UI 컴포넌트
   - 인증 컴포넌트

5. **핵심 기능 컴포넌트 개발** (최소 스타일링)
   - 지도 관련 컴포넌트
   - 리뷰 관련 컴포넌트
   - 레이아웃 컴포넌트

6. **페이지 개발** (기능 중심, 최소 스타일링)
   - 기본 레이아웃
   - 홈 페이지(지도)
   - 로그인 페이지
   - 리뷰 추가 페이지
   - 랭킹 페이지
   - 리뷰 상세 페이지

7. **API 엔드포인트 개발**
   - 리뷰 API
   - 장소 API

8. **테스트 및 기능 확인**
   - 인증 흐름 테스트
   - 리뷰 CRUD 테스트
   - 지도 및 검색 테스트
   - 랭킹 기능 테스트

9. **UI/UX 디자인 적용** (TailwindCSS)
   - 디자인 시스템 정의
   - UI 컴포넌트 스타일링
   - 페이지별 디자인 적용
   - 반응형 디자인 적용

10. **최적화 및 마무리**
    - 성능 최적화
    - 오류 처리 및 예외 상황 대응
    - 배포 준비

### 특별 요구사항
- 디자인은 마지막에 일관성 있게 적용하고 싶습니다.
- 사용자는 오직 하나의 음식점만 리뷰할 수 있습니다.
- 지도에는 마커 클러스터링과 사용자 위치 기능이 필요합니다.
- 반응형 디자인으로 모바일에서도 잘 작동해야 합니다.

현재 프로젝트 개발을 시작하려고 합니다. 개발 순서에 따라 적절한 코드와 설명을 제공해주세요.
```

이 프롬프트는 프로젝트의 요구사항, 기술 스택, 파일 구조, 데이터 모델 및 개발 순서를 포함하고 있어 새 채팅에서 Claude가 이전 대화의 맥락을 이해하고 도움을 줄 수 있도록 합니다.