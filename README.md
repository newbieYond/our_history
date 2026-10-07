# Our History · 성호와 세인의 여행

제주와 홋카이도 여행 가이드를 하나의 React 19 / Vite 8 앱으로 통합했습니다. 여행 선택 홈에서 여행을 열고, 공통 일정·장소·평가·노트 화면을 여행별 테마로 이용합니다.

- 웹사이트: https://newbieyond.github.io/our_history/
- 제주: https://newbieyond.github.io/our_history/#/jeju/home
- 홋카이도: https://newbieyond.github.io/our_history/#/hokkaido/home
- 날짜별 직접 링크: `#/jeju/itinerary/2`

## 실행

Node.js 22.13 이상과 pnpm 10을 사용합니다. `packageManager`에 pnpm 버전이 고정되어 있습니다.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

## 공통 모듈과 여행별 설정

```text
src/
  App.tsx                    # 여행/화면/날짜 라우팅과 컨텍스트
  components/                # 여행 선택, 일정, 장소, 평가, 상세, 노트, 체크리스트
  lib/                       # 공통 타입, 지도 조작, 평점, URL, 브라우저 저장
  themes/
    base.css                 # 공통 레이아웃
    trips.css                # 여행 테마와 공통 화면 스타일
    geo-map.css              # 실제 지도와 선택 상세 스타일
    collection.css           # 전체 여행 선택 홈
  trips/
    index.ts                 # 여행 폴더 자동 등록
    jeju/                    # 제주 데이터와 autumn 테마 설정
    hokkaido/                # 홋카이도 데이터와 winter 테마 설정
public/trips/                # 여행별 이미지; 동일 파일명도 충돌하지 않음
```

여행 데이터는 `Trip` 타입으로 통일했습니다. 원본 장소 JSON은 유지하고 각 `index.ts`에서 공통 형식으로 변환합니다. 새 여행은 처음부터 `Trip` 형식으로 작성하면 됩니다. 화면 컴포넌트에는 특정 여행의 일정·이름·날짜를 넣지 않습니다.

`shopping`과 `checklist`에 데이터가 있는 여행만 해당 메뉴가 나타납니다. 두 여행은 공통 실제 지도를 사용합니다. `geoMap`에 기본 시야와 권역을, 장소에 위경도와 `mapRegion`을 지정하면 날짜별·전체·권역별 지도가 연결됩니다. 검색·권역·종류 태그가 지도와 목록에 함께 적용됩니다. 체크리스트 완료 상태는 여행별로 현재 브라우저에 저장되며, 서버 동기화는 하지 않습니다. 평점과 의견은 기존 데이터 표시를 유지하며 편집 화면을 추가하지 않았습니다. 예비 장소는 날짜별 목록과 지도에 항상 표시합니다.

홋카이도의 일본어 회화 페이지(`#/hokkaido/phrases`)에는 일정에 맞춘 표현 59개가 있습니다. 상황·날짜 태그와 검색으로 필터링하고 일본어·해석·한글 독음을 함께 볼 수 있습니다. 회화 데이터가 있는 여행만 메뉴가 나타나며 `Trip.phrasebook`으로 다른 여행에도 추가할 수 있습니다. [회화 작성 기준](docs/phrases.md)을 참고하세요.

## 새 여행 추가

```sh
pnpm new:trip osaka "오사카" 2027-03-01 2027-03-05
```

생성되는 `src/trips/osaka/index.ts`의 소개·날짜별 일정·장소를 작성하고, `public/trips/osaka/`에 이미지를 넣으세요. 대표 이미지의 `cover` 경로도 변경하세요. 개발 시작용 이미지는 기존 제주 이미지가 임시로 지정됩니다. 여행 목록과 URL은 자동 등록됩니다. 같은 ID를 재사용하면 기존 파일을 덮어쓰지 않습니다.

별도 테마를 만들려면 `src/themes/trips.css`에 `.theme-osaka`를 추가하고 여행 설정의 `theme`을 `osaka`로 지정하세요. `--ink`, `--paper`, `--surface`, `--rust`, `--rust-dark`, `--mist`, `--line`, `--muted`, `--hero-background`, `--sans`로 분위기를 지정합니다. 공통 화면을 복제할 필요가 없습니다.

더 자세한 규칙은 [여행 추가 가이드](docs/adding-a-trip.md), 통합 기준은 [마이그레이션 기록](docs/migration.md), 검증 결과는 [QA 기록](docs/qa.md), 위치 출처와 조작 방식은 [지도 안내](docs/maps.md)를 참고하세요.

## 배포

공개 저장소의 `main`에 푸시하면 `.github/workflows/deploy-pages.yml`이 테스트·타입 검사·빌드 후 GitHub Pages에 배포합니다. 저장소 Settings → Pages → Source는 **GitHub Actions**입니다. PR에는 별도 CI가 테스트와 빌드를 실행합니다.

`vite.config.ts`의 기본 경로는 `/our_history/`입니다. 새로고침이 가능한 해시 라우팅을 사용해 Pages의 하위 경로 404를 피합니다. 다른 호스팅 경로를 쓰면 `base`를 수정하세요. 공개 사이트의 일정·장소·이미지는 방문자에게 제공되는 데이터입니다.
