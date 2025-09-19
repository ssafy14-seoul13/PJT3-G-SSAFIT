# PJT3-G-SSAFIT
상현, 가은

SSAFIT 데이터 자료구조 기획


[1] 개요 - SSAFIT 웹 애플리케이션의 핵심 기능을 구현하기 위한 데이터 관리 방안 

[2] 자료구조 상세 기획

---

2-1. 회원 데이터 (Users) 👨‍🦱

자료구조: Object

✅ 활용 목적

 아이디의 중복을 빠르게 확인하고, 로그인 시 특정 사용자의 정보를 신속하게 조회하기 위함 아이디를 객체의 키(Key)로 사용하면 배열을 순회하는 것보다 효율적입니다.

✅ 저장 위치

localStorage (브라우저를 닫아도 데이터가 유지됨)

✅ 세부 구조

        JavaScript
        
        {
        "userId_1": {
            "userId": "userId_1",
            "name": "사용자 이름",
            "email": "email@example.com",
            "password": "hashed_password",
            "joinDate": "2025-09-19T..."
        },
        "userId_2": { ... }
        }

---

2-2 동영상 데이터 (Videos) 📹

자료구조: Array

✅ 활용 목적

 영상 목록을 순서대로 보여주거나, 운동 부위별로 필터링하는 데 가장 적합합니다. Array.prototype.filter(), Array.prototype.find() 등의 내장 메서드를 쉽게 활용할 수 있습니다.

✅ 저장 위치
 video.json 파일

✅ 세부 구조

        JSON

        [
        {
            "id": "videoId_1",
            "title": "영상 제목",
            "part": "운동 부위",
            "channelName": "채널 이름",
            "url": "유튜브 embed URL"
        },
        { ... }
        ]

---


2-3. 리뷰 데이터 (Reviews) 💬

✅ 자료구조

Object 내부에 Array (동영상별로 분리)

✅ 활용 목적

특정 동영상 페이지에 접속했을 때 해당 영상의 리뷰만 효율적으로 불러오기 위함입니다. 동영상 ID를 키(Key)로 사용하여 필요한 데이터에만 빠르게 접근할 수 있습니다.

✅ 저장 위치

localStorage (각 동영상별로 다른 키 사용)

✅ 세부 구조

키(Key): reviews_ + videoId

값(Value): 해당 동영상에 대한 리뷰 객체들의 배열

    JavaScript

    // 'localStorage'에 저장될 예시
    {
    "reviews_gMaB-fG4u4g": [
        {
        "id": 1,
        "author": "리뷰 작성자",
        "content": "리뷰 내용",
        "date": "2025.09.19",
        "likes": 5,
        "isMine": true
        },
        { ... }
    ],
    "reviews_swRNeYw1JkY": [ ... ]
    }

---