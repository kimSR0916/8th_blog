---
title: 코스 추천의 제한 시간을 15초에서 55초로 늘리기까지
description: LLM을 여러 번 부르는 코스 추천에서 제한 시간을 어떻게 나누고, 운영에서 무엇을 보고 값을 고쳤는지 정리했습니다.
date: 2026-11-24
authors: [team]
tags: [AI, LLM, 운영]
draft: false
---

KeepGo의 코스 추천은 사용자가 화면에서 기다리는 요청입니다. 이 안에서 후보 검색, 재순위, 코스 조합, 지도 API 호출이 이어집니다. 어느 하나가 길어지면 뒤 단계가 쓸 시간이 사라집니다.

그래서 전체 제한 시간을 두고 구간별 예산을 나눴습니다. 예산을 넘긴 검색이나 LLM 구간은 요청을 실패시키지 않고, **LLM을 쓰지 않는 방식으로 대신** 처리합니다.

## 고정 예산은 거의 항상 대체로 빠졌다

처음 생각한 방식은 재순위 4초, 조합 5초처럼 자르는 것이었습니다. 그런데 Gemini 실측이 재순위 4~5초, 조합 5초였습니다. 실측값이 예산과 거의 같으니 대부분 시간 초과로 끝날 수밖에 없었습니다.

지금은 고정값으로 자르지 않고 **남은 시간에서 떼어 줍니다.** 남은 시간이 2초보다 적으면 LLM을 부르지 않고 바로 대체 방식으로 넘어갑니다.

## 운영에서 두 번 더 늘렸다

| 시점 | 제한 시간 | 계기 |
| --- | --- | --- |
| 처음 | 15초 | |
| 10월 23일 운영 이후 | 25초 | 재순위가 4.6초 걸린 뒤 조합이 8.4초에 끊김 |
| 10월 28일 운영 이후 | 55초 | Gemini 재순위가 5초 몫에서 끊김 |

55초에는 또 다른 이유가 있습니다. 추천은 직접 띄운 GPU 모델을 먼저 부르고, 실패하면 Gemini를 부릅니다. 두 번의 기회를 모두 담을 시간이 필요했습니다. GPU의 조합은 준비된 상태에서도 13.7~22.8초가 걸렸습니다.

재순위는 이후 LLM 대신 점수를 매기는 결정 모델로 바뀌었습니다. 표는 그 전의 기록입니다.

## 대체 호출의 몫을 먼저 남긴다

GPU에 남은 시간을 전부 주면 실패했을 때 Gemini를 부를 시간이 없습니다. 그래서 조합에서는 **Gemini 몫 10초를 먼저 떼어 두고** 나머지를 GPU에 줍니다. 10초는 Gemini의 기준 p95(재순위 8.3초, 조합 10.3초)를 보고 5초에서 올린 값입니다.

핵심 구조를 줄이면 이렇습니다.

```python
try:
    return await asyncio.wait_for(gpu.ainvoke(prompt), timeout=gpu_timeout)
except Exception:
    left = total - (time.monotonic() - started)
    return await asyncio.wait_for(gemini.ainvoke(prompt), timeout=left)
```

GPU가 꺼져 있다가 켜지는 데는 12~106초가 걸립니다. 이때는 Gemini가 답하지만, 실패한 GPU 요청도 헛되지 않습니다. 요청을 받은 GPU가 컨테이너를 띄우기 시작하기 때문입니다.

## 잘 동작하는 대체는 고장을 숨긴다

10월 28일 운영에서 GPU 주소가 잘못 설정돼 모든 호출이 500으로 실패했습니다. 그런데 Gemini가 대신 답해서 **응답은 정상으로 보였습니다.**

이후 두 가지를 남기도록 했습니다.

- 호출마다 어느 모델이 답했고 왜 넘어갔는지 로그 한 줄을 기록합니다.
- 시간 초과가 아닌 GPU 오류는 Sentry로 보냅니다. 시간 초과는 GPU를 켜는 동안 흔히 생기므로 보내지 않습니다.

## 배운 점

- 예산은 감이 아니라 실측 분포에서 정해야 합니다. 평균과 같은 예산은 절반쯤 실패하는 예산입니다.
- 대체 경로를 둔다면 그 경로가 쓸 시간도 함께 예약해야 합니다.
- 대체가 있을수록 원래 경로의 고장을 따로 알려야 합니다.

## 참고한 코드

- [app/core/config.py](https://github.com/100-hours-a-week/KTB4-8th-AI/blob/e355d38/app/core/config.py): 제한 시간과 변경 이유
- [app/models/factory.py](https://github.com/100-hours-a-week/KTB4-8th-AI/blob/e355d38/app/models/factory.py): GPU 우선 호출과 대체
- [app/services/recommend_courses.py](https://github.com/100-hours-a-week/KTB4-8th-AI/blob/e355d38/app/services/recommend_courses.py): 구간별 예산
