# 글쓰기 로그인 서버

웹 편집기의 GitHub 버튼 로그인을 처리하는 Cloudflare Worker입니다. 블로그를 읽는 데는 쓰이지 않습니다.

`src/index.js`는 [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)의 커밋 `e62e76a`를 그대로 가져온 것입니다(MIT, `LICENSE.txt`).

## 배포

이 폴더에서 실행합니다.

```bash
npx wrangler@4.167.0 login
npx wrangler@4.167.0 deploy
```

출력된 Worker 주소로 GitHub App을 만듭니다.

- Redirect URI(Callback URL): `<Worker 주소>/callback`
- 사용자 토큰 만료: 켬
- Webhook: 끔
- Repository permissions: **Contents 읽기·쓰기**만
- 설치 대상: `8th_blog` 저장소만

App의 Client ID와 Secret을 넣습니다. 값은 물어볼 때 붙여 넣으며, 채팅이나 저장소에 남기지 마세요.

```bash
npx wrangler@4.167.0 secret put GITHUB_CLIENT_ID
npx wrangler@4.167.0 secret put GITHUB_CLIENT_SECRET
```

마지막으로 `public/admin/config.yml`의 `backend`에 `base_url: <Worker 주소>`를 넣고 `auth_methods`를 `[oauth]`로 바꿉니다.
