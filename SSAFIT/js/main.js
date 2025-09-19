document.addEventListener('DOMContentLoaded', () => {
    const videoListContainer = document.querySelector('.video-list-container');
    const exerciseVideosContainer = document.querySelector('.exercise-videos-container');
    const partButtons = document.querySelectorAll('.part-btn');
    const algorithmContainer = document.getElementById('algorithm-recommendation-container');
    const routineContainer = document.getElementById('routine-container');

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

            // Run and render algorithms
            runAlgorithms(videos);
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
            loginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';
            userName.style.display = 'inline-block';
            userName.textContent = `${user.name}님`;
            userInfoText.innerHTML = `
                <strong>${user.name}</strong>님, 환영합니다!<br>
                <small>오늘도 건강한 운동 하세요! 🏋️‍♂️</small>
            `;
        } else {
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

    // 새로 추가된 알고리즘 추천 영상을 렌더링
    function renderAlgorithmVideos(videoList) {
        renderVideos(algorithmContainer, videoList);
    }

    // 새로 추가된 운동 루틴 추천을 렌더링
    function renderRoutine(path, bellmanFordResult, videos) {
        routineContainer.innerHTML = '';

        const routineHeader = document.createElement('h4');
        // routineHeader.textContent = "벨만-포드 기반 목표 달성 경로 (최대 효과)";
        routineContainer.appendChild(routineHeader);

        const routineList = document.createElement('ol');
        routineList.classList.add('routine-list');

        // 운동 단계에 임의의 영상 할당
        const stageVideos = {
            '시작': '',
            '스트레칭': 'tzN6ypk6Sps',
            '유산소': 'gMaB-fG4u4g',
            '요가': 'swRNeYw1JkY',
            '근력운동': '54tTYO-vU2E',
            '목표달성': ''
        };

        if (path) {
            path.forEach(stage => {
                if (stage !== '시작' && stage !== '목표달성') {
                    const videoId = stageVideos[stage];
                    const video = videos.find(v => v.id === videoId);
                    const routineItem = document.createElement('li');
                    routineItem.innerHTML = `
                        <span class="stage-name">${stage}</span>: <strong>${video.title}</strong>
                    `;
                    routineList.appendChild(routineItem);
                }
            });
        }
        routineContainer.appendChild(routineList);

        const bellmanFordResultText = document.createElement('p');
        bellmanFordResultText.classList.add('bellman-ford-result');
        // if (bellmanFordResult) {
        //     bellmanFordResultText.textContent = `경로 총합(음의 가중치): ${bellmanFordResult['목표달성']}`;
        // } else {
        //     bellmanFordResultText.textContent = '경로를 계산할 수 없습니다 (음의 사이클 감지)';
        // }
        routineContainer.appendChild(bellmanFordResultText);
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

    // runAlgorithms 함수를 이 위치에 정의
    function runAlgorithms(videos) {
        console.log("--- SSAFIT 알고리즘 실행 ---");

        // --- 2-1. 관련 영상 추천 기능 (다익스트라) ---
        console.log("### 2-1. 관련 영상 추천 기능 (다익스트라) 실행");
        function calculateSimilarity(v1, v2) {
            return v1.part === v2.part ? 0.9 : 0.2;
        }
        const graph = {};
        videos.forEach(v1 => {
            graph[v1.id] = {};
            videos.forEach(v2 => {
                if (v1.id !== v2.id) {
                    const similarity = calculateSimilarity(v1, v2);
                    graph[v1.id][v2.id] = 1 - similarity;
                }
            });
        });
        function dijkstra(startNodeId) {
            const distances = {};
            const visited = new Set();
            const priorityQueue = [];
            videos.forEach(v => {
                distances[v.id] = Infinity;
            });
            distances[startNodeId] = 0;
            priorityQueue.push({ id: startNodeId, distance: 0 });
            while (priorityQueue.length > 0) {
                priorityQueue.sort((a, b) => a.distance - b.distance);
                const { id: currentNodeId, distance: currentDistance } = priorityQueue.shift();
                if (visited.has(currentNodeId)) continue;
                visited.add(currentNodeId);
                for (const neighborId in graph[currentNodeId]) {
                    const weight = graph[currentNodeId][neighborId];
                    if (!visited.has(neighborId) && currentDistance + weight < distances[neighborId]) {
                        distances[neighborId] = currentDistance + weight;
                        priorityQueue.push({ id: neighborId, distance: distances[neighborId] });
                    }
                }
            }
            return distances;
        }
        const startVideo = videos[0];
        const recommendedDistances = dijkstra(startVideo.id);
        const sortedRecommendations = Object.keys(recommendedDistances)
            .filter(id => id !== startVideo.id)
            .sort((a, b) => recommendedDistances[a] - recommendedDistances[b])
            .slice(0, 3)
            .map(id => videos.find(v => v.id === id));
        console.log(`- '${startVideo.title}' 영상과 유사한 영상 추천:`, sortedRecommendations);
        renderAlgorithmVideos(sortedRecommendations);

        // --- 2-2. 운동 루틴 추천 시스템 (벨만-포드) ---
        console.log("\n### 2-2. 운동 루틴 추천 시스템 (벨만-포드) 실행");
        const bellmanFordGraph = [
            { from: '시작', to: '스트레칭', weight: -2 },
            { from: '시작', to: '유산소', weight: -5 },
            { from: '스트레칭', to: '요가', weight: -3 },
            { from: '유산소', to: '근력운동', weight: -3 },
            { from: '요가', to: '근력운동', weight: -4 },
            { from: '근력운동', to: '목표달성', weight: -10 }
        ];
        function bellmanFord(edges, numVertices, startNode) {
            const distances = {};
            const predecessors = {}; // 경로를 추적하기 위한 객체
            numVertices.forEach(v => {
                distances[v] = Infinity;
                predecessors[v] = null;
            });
            distances[startNode] = 0;
            for (let i = 0; i < numVertices.length - 1; i++) {
                for (const edge of edges) {
                    if (distances[edge.from] !== Infinity && distances[edge.from] + edge.weight < distances[edge.to]) {
                        distances[edge.to] = distances[edge.from] + edge.weight;
                        predecessors[edge.to] = edge.from;
                    }
                }
            }
            // 음의 사이클 검출
            for (const edge of edges) {
                if (distances[edge.from] !== Infinity && distances[edge.from] + edge.weight < distances[edge.to]) {
                    console.error("음의 사이클이 감지되었습니다! 잘못된 운동 조합일 수 있습니다.");
                    return { distances: null, path: null };
                }
            }
            // 경로 재구성
            const path = [];
            let current = '목표달성';
            while(current) {
                path.unshift(current);
                current = predecessors[current];
            }
            return { distances: distances, path: path };
        }
        const vertices = ['시작', '스트레칭', '유산소', '요가', '근력운동', '목표달성'];
        const bellmanFordResult = bellmanFord(bellmanFordGraph, vertices, '시작');
        console.log("- '최대 효과'를 위한 최단 경로(음의 가중치 합):", bellmanFordResult.distances);
        console.log("- 추천 운동 루틴 순서:", bellmanFordResult.path);
        renderRoutine(bellmanFordResult.path, bellmanFordResult.distances, videos);
    }
});