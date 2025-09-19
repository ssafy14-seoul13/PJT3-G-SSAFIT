// 공통 함수들
function showAlert(elementId, message, type) {
    const alertElement = document.getElementById(elementId);
    alertElement.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'} me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// 로그인 처리
function handleLogin(e) {
    e.preventDefault();
    
    const userId = document.getElementById('loginUserId').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!userId || !password) {
        showAlert('loginAlert', '아이디와 비밀번호를 입력해주세요.', 'danger');
        return;
    }

    // localStorage에서 사용자 정보 가져오기
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const userData = users[userId];
    
    if (!userData) {
        showAlert('loginAlert', '존재하지 않는 아이디입니다.', 'danger');
        return;
    }

    if (userData.password !== password) {
        showAlert('loginAlert', '비밀번호가 올바르지 않습니다.', 'danger');
        return;
    }

    // 로그인 성공 - 현재 로그인한 사용자 정보 저장
    sessionStorage.setItem('currentUser', JSON.stringify(userData));
    
    showAlert('loginAlert', '로그인 성공! 환영합니다.', 'success');
    
    // 1초 후 메인 페이지로 이동
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// 초기화
function initializeLogin() {
    // 테스트 사용자 추가 (처음 실행 시에만)
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users['test']) {
        users['test'] = {
            userId: 'test',
            name: '테스트 사용자',
            email: 'test@example.com',
            password: 'test123',
            joinDate: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify(users));
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
    
    // 로그인 폼 이벤트 리스너
    document.getElementById('loginFormElement').addEventListener('submit', handleLogin);
});