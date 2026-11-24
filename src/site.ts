// 블로그 이름, 소개 문구, 주소는 모두 여기서 바꿉니다.
const org = 'https://github.com/100-hours-a-week';

export const SITE = {
  name: '8th Blog',
  tagline: '만들면서 배운 것을 적습니다',
  description: 'KeepGo를 만드는 8th 팀이 부딪히고 배운 것을 기록하는 기술 블로그입니다.',
  // 배포 주소. 커스텀 도메인을 쓰면 origin을 그 도메인으로, base를 '/'로 바꾸세요.
  // public/admin/config.yml의 site_url과 display_url도 함께 바꿔야 합니다.
  origin: 'https://kimsr0916.github.io',
  base: '/8th_blog',
  // 팀 프로젝트 저장소
  repos: [
    { label: 'Wiki', url: `${org}/KTB4-8th-wiki`, about: '기획과 팀 문서' },
    { label: 'FE', url: `${org}/KTB4-8th-FE`, about: '프론트엔드' },
    { label: 'BE', url: `${org}/KTB4-8th-BE`, about: '백엔드' },
    { label: 'AI', url: `${org}/KTB4-8th-AI`, about: 'AI 서버' },
    { label: 'Cloud', url: `${org}/KTB4-8th-CLOUD`, about: '인프라와 배포' },
  ],
};
