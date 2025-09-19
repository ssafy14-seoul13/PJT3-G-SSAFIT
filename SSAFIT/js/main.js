document.addEventListener('DOMContentLoaded', () => {
    const videoListContainer = document.querySelector('.video-list-container');
    const exerciseVideosContainer = document.querySelector('.exercise-videos-container');
    const partButtons = document.querySelectorAll('.part-btn');
    
    // 로그인 관련 요소들
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const userName = document.getElementById('userName');
    const userInfoText = document.getElementById('userInfoText');

    // JSON 파일 불러오기 - 경로 수정 (html 폴더에서 상위 폴더의 data 폴더로)
    fetch('../data/video.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(videos => {
            console.log('비디오 데이터 로드 완료:', videos);
            
            // 초기 설정
            checkLoginStatus();
            renderRecommendedVideos(videos);
            attachButtonListeners(videos);

            // 페이지 로드 시 '전신' 버튼이 선택된 상태로 시작
            const initialPart = document.querySelector('.part-btn.active').dataset.part;
            renderExerciseVideos(videos, initialPart);
        })
        .catch(error => {
            console.error('비디오 데이터를 불러오는 중 오류 발생:', error);
            
            // 오류 발생 시 사용자에게 알림
            videoListContainer.innerHTML = '<p style="text-align: center; color: #f44336; padding: 20px;">비디오 데이터를 불러올 수 없습니다.</p>';
            exerciseVideosContainer.innerHTML = '<p style="text-align: center; color: #f44336; padding: 20px;">비디오 데이터를 불러올 수 없습니다.</p>';
        });

    // 로그인 상태 확인 및 UI 업데이트
    function checkLoginStatus() {
        const currentUser = sessionStorage.getItem('currentUser');
        
        if (currentUser) {
            const user = JSON.parse(currentUser);
            // 로그인된 상태
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            userName.style.display = 'inline-block';
            userName.textContent = `${user.name}님`;
            userInfoText.innerHTML = `
                <strong>${user.name}</strong>님, 환영합니다!<br>
                <small>오늘도 건강한 운동 하세요! 🏋️‍♂️</small>
            `;
        } else {
            // 로그인되지 않은 상태
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            userName.style.display = 'none';
            userInfoText.textContent = '로그인하여 개인화된 정보를 확인하세요';
        }
    }

    // 로그아웃 처리
    function handleLogout() {
        sessionStorage.removeItem('currentUser');
        checkLoginStatus();
        
        // 로그아웃 알림 (선택사항)
        alert('로그아웃되었습니다.');
    }

    // 비디오 인네일을 HTML에 렌더링하는 공통 함수
    function renderVideos(container, videoList) {
        container.innerHTML = '';
        
        if (videoList.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">해당 부위의 영상이 없습니다.</p>';
            return;
        }
        
        videoList.forEach(video => {
            const videoThumbnail = document.createElement('div');
            videoThumbnail.classList.add('video-thumbnail');
            const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/hqdefault.jpg`;
            videoThumbnail.innerHTML = `
                <img src="${thumbnailUrl}" alt="${video.title} 인네일" onerror="this.src='https://via.placeholder.com/320x180?text=Video+Thumbnail'">
                <div class="video-info">
                    <h4>${video.title}</h4>
                    <p>${video.channelName}</p>
                </div>
            `;
            
            // 비디오 클릭 시 디테일 페이지로 이동
            videoThumbnail.addEventListener('click', () => {
                window.location.href = `detailpage.html?id=${video.id}`;
            });
            
            container.appendChild(videoThumbnail);
        });
    }

    // 추천 영상 리스트를 동적으로 생성
    function renderRecommendedVideos(allVideos) {
        const recommendedVideos = allVideos.slice(0, 4);
        renderVideos(videoListContainer, recommendedVideos);
    }

    // 선택한 운동 부위에 대한 영상 리스트를 동적으로 생성
    function renderExerciseVideos(allVideos, part) {
        const targetPart = (part === '코어') ? '복부' : part;
        const filteredVideos = allVideos.filter(video => video.part === targetPart);
        renderVideos(exerciseVideosContainer, filteredVideos);
    }

    // 운동 부위 버튼에 이벤트 리스너를 추가
    function attachButtonListeners(videos) {
        partButtons.forEach(button => {
            button.addEventListener('click', () => {
                partButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                const selectedPart = button.dataset.part;
                renderExerciseVideos(videos, selectedPart);
            });
        });
    }

    // 로그아웃 버튼 이벤트 리스너
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
});