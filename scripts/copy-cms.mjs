// 웹 편집기 본체를 잠금 파일에 고정된 버전으로 블로그에서 직접 제공합니다.
// 글꼴과 일부 추가 모듈은 편집기가 외부 CDN에서 불러옵니다.
import { copyFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
copyFileSync(
  fileURLToPath(new URL('node_modules/@sveltia/cms/dist/sveltia-cms.js', root)),
  fileURLToPath(new URL('public/admin/sveltia-cms.js', root)),
);
