# 8th Blog

8th 팀의 기술 블로그입니다. [Astro](https://astro.build)로 만들고 GitHub Pages로 배포합니다.

## 시작하기

Node.js 22.12 이상이 필요합니다.

```bash
npm ci
npm run dev
```

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 (초안 포함) |
| `npm run new -- <slug> [글쓴이 id]` | 새 글 초안 생성 |
| `npm run build` | 타입 검사, 빌드, 검색 색인 생성 |
| `npm run preview` | 빌드 결과 확인 |

글 쓰는 방법은 [글쓰기 가이드](src/content/posts/how-to-write/index.md)에 있습니다.

## 구조

- `src/site.ts`: 블로그 이름, 소개 문구, 배포 주소
- `src/content/posts/`: 글
- `src/content/authors/`: 글쓴이
- `src/content.config.ts`: 글과 글쓴이의 필수 항목
- `src/styles/global.css`: 색과 글꼴을 포함한 전체 스타일

## 배포

`main`에 push하면 `.github/workflows/blog.yml`이 빌드하고 배포합니다. 처음 한 번은 저장소의 **Settings > Pages > Build and deployment > Source**를 **GitHub Actions**로 바꿔야 합니다.

커스텀 도메인을 쓰려면 `src/site.ts`의 `origin`을 그 도메인으로, `base`를 `/`로 바꾸고 같은 Pages 설정 화면에 도메인을 등록합니다.
