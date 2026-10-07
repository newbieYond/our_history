# 새 여행 추가 가이드

1. `pnpm new:trip <영문-id> "이름" YYYY-MM-DD YYYY-MM-DD`를 실행합니다.
2. `src/trips/<id>/index.ts`에서 `Trip` 데이터를 작성합니다. 일정이 많아지면 `days.json`, `places.json`을 분리해 import하세요.
3. `public/trips/<id>/`에 이미지를 저장합니다. `cover`와 `imagePath` 등은 `trips/<id>/파일명`처럼 지정합니다. `assetUrl()`이 Pages 배포 경로를 붙입니다.
4. `theme`에 기존 `winter` / `autumn`을 지정하거나 `src/themes/trips.css`에 새로운 `.theme-<이름>`을 만듭니다.
5. `pnpm test`와 `pnpm build` 후 모바일·데스크톱에서 여행 목록과 `#/<id>/home`, `#/<id>/itinerary/1`을 확인합니다.

`src/trips/index.ts`는 `./*/index.ts`를 자동 수집하므로 여행 추가 때 라우터·홈·공통 컴포넌트를 수정하지 않습니다. `id`는 고유해야 하고 영문 소문자와 하이픈으로 구성하세요.

## 데이터 규칙

- `days`: 날짜순으로 최소 하나의 일정을 지정합니다. `date`, `title`, `area`, `flow`, `food`, `tone`, `detail`, `status`를 채웁니다. `flow`는 ` · `로 동선을 구분합니다.
- `places`: 여행 안에서 ID가 고유해야 합니다. `days`는 해당하는 날짜 번호를 모두 지정합니다. 여러 날짜에 방문하는 장소는 한 레코드에 `[1, 7]`처럼 저장합니다. `day`는 대표 날짜입니다.
- `seonghoRating`, `seinRating`: 0~5 또는 `null`입니다. 0과 `null`은 미평가이며 평균 계산에서 제외됩니다.
- `googleMapsUrl`: 기존 정확한 장소 URL을 우선 유지합니다.
- `isReserve`: 예비 후보 여부입니다. 예비 장소도 날짜별 목록과 지도에 항상 표시하며 예비 상태 표기를 유지합니다.
- `notes`, `shopping`, `checklist`, `links`: 여행별 자료가 있으면 지정합니다. 빈 쇼핑·체크리스트 메뉴는 표시되지 않습니다.
- `schedule`의 `placeName`: 해당 장소 이름을 지정하면 일정 항목 선택 시 지도 마커와 상세가 연동됩니다.

## 여행 회화 추가

`Trip.phrasebook`에 언어 이름·언어 코드, 소개·독음 안내, `situations`와 `phrases`를 지정하면 회화 메뉴가 자동으로 나타납니다. 홋카이도의 `phrases.json`을 참고하세요. 각 표현에는 고유 `id`, 상황 `situationId`, 원문 `original`, 해석 `translation`, 한글 독음 `pronunciation`, 사용 맥락 `context`, 일정 날짜 `days`를 지정합니다. 공통 페이지는 상황·날짜·검색을 함께 필터링하고 같은 태그를 다시 누르면 전체로 돌아갑니다.

## 실제 지도 사용

`Trip.geoMap`에 `center: [위도, 경도]`, `zoom`, `regions: ["권역 이름", ...]`을 지정합니다. 각 장소에 실제 `latitude`, `longitude`, `mapRegion`을 넣으면 공통 지도와 권역 태그가 자동으로 연결됩니다. 좌표가 없는 장소는 목록에 남고 지도에는 제외되며 미등록 수가 표시됩니다.

좌표 출처·확인일은 여행 폴더의 `coordinates.json`처럼 별도로 보관하세요. 이름만 같은 다른 지점을 선택하지 않도록 주소와 지점을 대조합니다. 일정은 `days`, 지도 권역은 `mapRegion`으로 구분합니다. 확인이 필요한 후보나 실내 대표 위치에는 `coordinateNote`를 지정합니다.

공통 `TravelMap`은 Leaflet과 Markercluster를 사용합니다. 드래그·휠·핀치 확대, 키보드 이동, 마커 묶기, 선택 상세, 필터 결과 전체 보기를 제공합니다. 검색·권역·종류는 지도와 목록에 함께 적용되고 지도 이동은 목록을 바꾸지 않습니다. OpenStreetMap 타일과 저작자 표시를 유지하며 타일 사전 다운로드·오프라인 저장을 하지 않습니다.

지도 설정이 없는 여행도 일정·장소 검색·상세·평가 등 모든 공통 화면을 사용할 수 있습니다. 기존 제주 일러스트 이미지와 원본 상대 좌표는 원본 자료로 보존합니다.
