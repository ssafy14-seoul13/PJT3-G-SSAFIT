document.addEventListener('DOMContentLoaded', () => {
    const videoPlayerSection = document.querySelector('.video-player-section');
    const reviewList = document.querySelector('.review-list');
    const writeReviewBtn = document.getElementById('write-review-btn');

    // 로그인 관련 요소들
    const loginBtn = document.querySelector('.login-btn');
    const logoutBtn = document.querySelector('.logout-btn');

    // URL 파라미터에서 영상 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const videoId = urlParams.get('id');

    // 썸네일과 재생 버튼 요소 가져오기
    const thumbnailContainer = document.querySelector('.thumbnail-container');
    const videoThumbnail = document.getElementById('video-thumbnail');
    const playButton = document.getElementById('play-button');

    // 비디오 데이터 로드 및 썸네일 설정
    if (videoId) {
        loadVideoData(videoId);
    } else {
        alert('영상을 찾을 수 없습니다.');
        window.location.href = 'index.html';
    }

    // 비디오 데이터 로드 함수
    async function loadVideoData(id) {
        try {
            const response = await fetch('../data/video.json');
            const videos = await response.json();
            const video = videos.find(v => v.id === id);
            
            if (video) {
                // 페이지 타이틀 업데이트
                document.title = `SSAFIT - ${video.title}`;
                
                // YouTube 썸네일 이미지 설정
                const thumbnailUrl = `https://img.youtube.com/vi/${video.id}/maxresdefault.jpg`;
                videoThumbnail.src = thumbnailUrl;
                videoThumbnail.alt = video.title;
            } else {
                alert('영상을 찾을 수 없습니다.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('비디오 데이터를 불러오는 중 오류 발생:', error);
            alert('비디오 데이터를 불러올 수 없습니다.');
        }
    }

    // 재생 버튼에 클릭 이벤트 리스너 추가
    if (playButton) {
        playButton.addEventListener('click', () => {
            if (videoId) {
                // iframe 요소 생성
                const videoIframe = document.createElement('iframe');
                videoIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
                videoIframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
                videoIframe.allowFullscreen = true;

                // 썸네일 컨테이너의 내용을 비우고 iframe으로 교체
                thumbnailContainer.innerHTML = '';
                thumbnailContainer.appendChild(videoIframe);
            }
        });
    }

    // 로그인 상태 확인 함수
    function checkLoginStatus() {
        const currentUser = sessionStorage.getItem('currentUser');
        
        if (currentUser) {
            const user = JSON.parse(currentUser);
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            return user;
        } else {
            loginBtn.style.display = 'inline-block';
            logoutBtn.style.display = 'none';
            return null;
        }
    }

    // 로그아웃 처리
    function handleLogout() {
        sessionStorage.removeItem('currentUser');
        checkLoginStatus();
        alert('로그아웃되었습니다.');
        window.location.href = 'index.html';
    }

    // 리뷰 데이터를 로컬스토리지에서 관리
    function getReviews() {
        const reviews = localStorage.getItem(`reviews_${videoId}`);
        return reviews ? JSON.parse(reviews) : [
            { id: 1, author: 'ssafy_user1', content: '정말 좋은 운동 영상이네요!', date: '2025.09.05', likes: 5, isMine: false },
            { id: 2, author: 'fitness_lover', content: '운동 부위별로 잘 설명해줘서 좋아요.', date: '2025.09.04', likes: 10, isMine: false }
        ];
    }

    function saveReviews(reviews) {
        localStorage.setItem(`reviews_${videoId}`, JSON.stringify(reviews));
    }

    let reviews = getReviews();
    const currentUser = checkLoginStatus();

    // 리뷰 렌더링 함수
    function renderReviews() {
        reviewList.innerHTML = '';
        
        if (reviews.length === 0) {
            reviewList.innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">첫 번째 리뷰를 작성해보세요!</p>';
            return;
        }

        reviews.forEach(review => {
            const reviewItem = document.createElement('div');
            reviewItem.classList.add('review-item');
            if (review.isMine) {
                reviewItem.classList.add('user-review');
            }
            reviewItem.dataset.reviewId = review.id;

            reviewItem.innerHTML = `
                <div class="review-meta">
                    <span class="review-author">${review.author}</span>
                    <span class="review-date">${review.date}</span>
                </div>
                <div class="review-content">${review.content}</div>
                <div class="review-actions">
                    <button class="like-button" data-likes="${review.likes}">👍 ${review.likes}</button>
                    ${review.isMine ? '<button class="action-btn edit-button">수정</button><button class="action-btn delete-button">삭제</button>' : ''}
                </div>
            `;
            reviewList.appendChild(reviewItem);
        });
        attachReviewEventListeners();
    }

    // 이벤트 리스너 부착
    function attachReviewEventListeners() {
        const likeButtons = document.querySelectorAll('.like-button');
        likeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!currentUser) {
                    alert('로그인 후 좋아요를 누를 수 있습니다.');
                    return;
                }

                const reviewId = parseInt(e.target.closest('.review-item').dataset.reviewId);
                const review = reviews.find(r => r.id === reviewId);
                
                if (!e.target.classList.contains('liked')) {
                    review.likes++;
                    e.target.classList.add('liked');
                    e.target.style.color = '#4CAF50';
                } else {
                    review.likes--;
                    e.target.classList.remove('liked');
                    e.target.style.color = '';
                }
                e.target.textContent = `👍 ${review.likes}`;
                saveReviews(reviews);
            });
        });

        const deleteButtons = document.querySelectorAll('.delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
                    const reviewId = parseInt(e.target.closest('.review-item').dataset.reviewId);
                    reviews = reviews.filter(r => r.id !== reviewId);
                    saveReviews(reviews);
                    renderReviews();
                    alert('리뷰가 삭제되었습니다.');
                }
            });
        });

        const editButtons = document.querySelectorAll('.edit-button');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const reviewId = parseInt(e.target.closest('.review-item').dataset.reviewId);
                const review = reviews.find(r => r.id === reviewId);
                const newContent = prompt('리뷰 내용을 수정해주세요:', review.content);
                
                if (newContent !== null && newContent.trim() !== '') {
                    review.content = newContent.trim();
                    review.date = new Date().toLocaleDateString('ko-KR');
                    saveReviews(reviews);
                    renderReviews();
                    alert('리뷰가 수정되었습니다.');
                }
            });
        });
    }

    // 작성 버튼 클릭 이벤트
    writeReviewBtn.addEventListener('click', () => {
        if (!currentUser) {
            alert('로그인 후 리뷰를 작성할 수 있습니다.');
            window.location.href = 'login.html';
            return;
        }

        const newContent = prompt('새로운 리뷰를 작성해주세요:');
        if (newContent !== null && newContent.trim() !== '') {
            const newReview = {
                id: reviews.length ? Math.max(...reviews.map(r => r.id)) + 1 : 1,
                author: currentUser.name,
                content: newContent.trim(),
                date: new Date().toLocaleDateString('ko-KR'),
                likes: 0,
                isMine: true
            };
            reviews.push(newReview);
            saveReviews(reviews);
            renderReviews();
            alert('리뷰가 작성되었습니다.');
        }
    });

    // 로그인/로그아웃 버튼 이벤트 리스너
    loginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });

    // 페이지 로드 시 리뷰 렌더링
    renderReviews();
});