---
title: ECS Task를 AZ에 나누고, 그 안에서는 모아 담기
description: 가용성과 비용 사이에서 Spread(AZ)와 Binpack을 함께 고른 이유와, 워크로드별로 EC2 풀을 나눈 기준을 정리했습니다.
date: 2026-11-24
authors: [team]
tags: [클라우드, AWS, ECS]
draft: false
---

ECS를 EC2 위에서 쓰면 Task를 어느 서버에 놓을지 정해야 합니다. 넓게 흩으면 서버 한 대가 죽어도 영향이 작지만 빈 공간이 많은 서버가 늘어납니다. 모아 담으면 비용이 줄지만 한 대가 죽을 때 영향이 커집니다.

KeepGo는 두 전략을 순서대로 적용했습니다. **가용 영역(AZ)에는 고르게 나누고, 같은 AZ 안에서는 모아 담습니다.**

## 설정

Terraform에서는 배치 전략을 적은 순서대로 적용합니다.

```hcl
ordered_placement_strategy {
  type  = "spread"
  field = "attribute:ecs.availability-zone"
}
ordered_placement_strategy {
  type  = "binpack"
  field = "memory"
}
```

- `spread`는 AZ 하나의 장애로 모든 Task가 함께 멈추는 것을 막습니다.
- `binpack`은 메모리가 이미 찬 서버부터 채웁니다. 빈 서버가 생기기 쉬워 서버 수를 줄일 수 있습니다.

## 감수하기로 한 것

이 방식에서는 EC2 한 대에 같은 서비스의 Task가 여럿 올라갈 수 있습니다. 그 서버가 죽으면 처리 용량이 한꺼번에 줄어듭니다.

KeepGo는 완전 무중단이 필수인 서비스가 아니라고 보고, 서버 단위로 흩는 비용 대신 **자동 복구와 AZ 분산**을 골랐습니다.

## 워크로드마다 풀을 나눈다

모든 Task를 한 풀에 넣으면 성격이 다른 작업끼리 자원을 다툽니다. 그래서 EC2 풀을 나눠 설계했습니다.

| 풀 | 작업 | 구매 방식 | 이유 |
| --- | --- | --- | --- |
| backend | API, 온라인 AI API | 온디맨드 | 남는 공간을 함께 사용 |
| sse | 챗봇·추천 스트리밍 | 온디맨드 | 오래 유지되는 연결을 분리 |
| worker | 영상 분석 같은 비동기 작업 | 1대까지 온디맨드, 이후 Spot | 중단돼도 다시 처리할 수 있음 |

백엔드와 AI API는 서버를 공유하지만 배포와 확장은 따로 합니다. 자원을 다툴 수 있다는 점은 Task마다 CPU와 메모리 한도를 두어 줄이고, 실제 경합이 보이면 풀을 나누기로 했습니다.

## 설계와 지금의 차이

설계가 모두 운영에 켜진 것은 아닙니다. 이 글을 쓰면서 확인한 운영 설정 파일에서는 백엔드와 AI API만 켜져 있습니다.

백엔드는 설정상 Task가 1개로 고정돼 있습니다. 애플리케이션 안의 캐시와 로컬 업로드 때문에 상태가 서버에 남아서, 이를 걷어 내기 전에는 늘릴 수 없습니다. **Task가 하나면 AZ 분산의 효과도 아직 없습니다.** 배치 전략보다 애플리케이션을 상태 없이 만드는 일이 먼저라는 뜻입니다.

## 배운 점

- 배치 전략은 하나를 고르는 문제가 아니라, 어떤 장애까지 막을지 층을 나누는 문제였습니다.
- 인프라의 확장 설정은 애플리케이션이 확장될 수 있을 때만 의미가 있습니다.

## 참고한 문서와 코드

- [ECS Service 배치 전략](https://github.com/100-hours-a-week/KTB4-8th-CLOUD/wiki/ECS-Service-%EB%B0%B0%EC%B9%98-%EC%A0%84%EB%9E%B5)
- [services.tf](https://github.com/100-hours-a-week/KTB4-8th-CLOUD/blob/1f33a71/infrastructure/terraform-v2/services.tf), [ecs.tf](https://github.com/100-hours-a-week/KTB4-8th-CLOUD/blob/1f33a71/infrastructure/terraform-v2/ecs.tf), [prod.tfvars](https://github.com/100-hours-a-week/KTB4-8th-CLOUD/blob/1f33a71/infrastructure/terraform-v2/prod.tfvars)
