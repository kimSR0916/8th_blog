// 사용법: npm run new -- <slug> [글쓴이 id]
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const [slug, author = 'team'] = process.argv.slice(2);
const content = fileURLToPath(new URL('../src/content/', import.meta.url));

function fail(message) {
  console.error(message);
  process.exit(1);
}

const pattern = /^[a-z0-9]+(-[a-z0-9]+)*$/;
if (!slug || !pattern.test(slug)) {
  fail('사용법: npm run new -- <slug> [글쓴이 id]\nslug에는 영문 소문자, 숫자, 하이픈만 쓸 수 있습니다. 예: redis-cache-stampede');
}
if (!pattern.test(author) || !existsSync(join(content, 'authors', `${author}.json`))) {
  fail(`글쓴이 "${author}"가 없습니다. src/content/authors/${author}.json을 먼저 추가하세요.`);
}

const dir = join(content, 'posts', slug);
if (existsSync(dir) || existsSync(`${dir}.md`)) fail(`"${slug}" 글이 이미 있습니다.`);

// 한국 시간 기준 오늘 날짜 (YYYY-MM-DD)
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Seoul' }).format(new Date());

mkdirSync(dir, { recursive: true });
writeFileSync(
  join(dir, 'index.md'),
  `---
title: 제목을 적어 주세요
description: 글 목록과 검색 결과에 보일 한두 문장을 적어 주세요.
date: ${today}
authors: [${author}]
tags: []
draft: true
---

## 어떤 문제였나

## 어떻게 풀었나

## 무엇을 배웠나
`,
);
console.log(`만들었습니다: src/content/posts/${slug}/index.md`);
