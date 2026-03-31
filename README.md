# Witter (Twitter Clone)

간단한 트위터 클론 프로젝트입니다.  
본 프로젝트는 노마드코더의 트위터 클론 강의를 기반으로 시작했으며,  
이후 좋아요 기능, 무한 스크롤, 계정 기능(비밀번호 재설정, 회원탈퇴) 등을 추가하고  
코드 구조를 개선하며 기능을 확장했습니다.

🔗 배포 링크: [프로젝트 링크](https://nwitter-study-a7edc.web.app/)

---

## 📌 주요 기능

- 트윗 작성 / 수정 / 삭제 (CRUD)
- 좋아요 기능 (Optimistic UI 적용)
- 이미지 업로드 (base64)
- 무한 스크롤 (Intersection Observer)
- Firebase Authentication 로그인

---

## 🛠 기술 스택

- React
- TypeScript
- Styled-components
- Firebase (Auth, Firestore, Hosting)

---

## 💡 주요 구현 포인트

- 커스텀 훅(useLike, useTweets)으로 로직 분리
- Optimistic UI로 사용자 경험 개선
- Intersection Observer를 활용한 무한 스크롤 구현
- 컴포넌트 재사용 구조 (Button, TextInputWithLimit 등)

---

## 🚀 배포

Firebase Hosting 사용

---
