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
- `isReserve`: 예비 후보 여부입니다. 예비 표시 스위치는 날짜별 장소 목록과 약도에 함께 적용됩니다.
- `notes`, `shopping`, `checklist`, `links`: 여행별 자료가 있으면 지정합니다. 빈 쇼핑·체크리스트 메뉴는 표시되지 않습니다.
- `schedule`의 `placeName`: 해당 장소 이름을 지정하면 일정 항목 선택 시 약도 마커와 상세가 연동됩니다.

## 약도 사용

제주처럼 직접 만든 약도를 사용할 때만 `Trip.map`을 지정합니다. `mainland`와 `inset` 이미지, 확대 구역의 `insetDay`와 `insetLabel`을 지정하고, 각 장소에 `mapPosition: {x, y}`를 0~100 비율로 넣습니다. `tags` 대신 공통 `days`로 날짜별 장소를 찾습니다.

약도 좌표는 일러스트 위의 상대 위치이며 실제 위경도 지도 투영이 아닙니다. Google 지도 링크를 통해 실제 장소와 길찾기를 확인합니다. 삽입 지도 안에 들어갈 장소는 대표 날짜인 `day`가 `insetDay`와 일치해야 합니다.

약도를 쓰지 않는 여행도 일정·장소 검색·상세·평가 등 모든 공통 화면을 사용할 수 있습니다.
