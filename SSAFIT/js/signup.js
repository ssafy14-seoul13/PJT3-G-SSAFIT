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

// 입력값 검증 함수
function validateSignupForm(userId, name, email, password, passwordConfirm) {
    if (!userId || !name || !email || !password || !passwordConfirm) {
        return '모든 필드를 입력해주세요.';
    }

    if (password !== passwordConfirm) {
        return '비밀번호가 일치하지 않습니다.';
    }

    if (password.length < 6) {
        return '비밀번호는 6자 이상이어야 합니다.';
    }

    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[userId]) {
        return '이미 존재하는 아이디입니다.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return '올바른 이메일 형식을 입력해주세요.';
    }

    return null; // 검증 통과
}

// 회원가입 처리
function handleSignup(e) {
    e.preventDefault();
    
    const userId = document.getElementById('signupUserId').value.trim();
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;
    const passwordConfirm = document.getElementById('signupPasswordConfirm').value;

    // 입력 검증
    const validationError = validateSignupForm(userId, name, email, password, passwordConfirm);
    if (validationError) {
        showAlert('signupAlert', validationError, 'danger');
        return;
    }

    // 기존 사용자 데이터 가져오기
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    
    // 새 사용자 정보 저장
    users[userId] = {
        userId: userId,
        name: name,
        email: email,
        password: password,
        joinDate: new Date().toISOString()
    };

    // localStorage에 저장
    localStorage.setItem('users', JSON.stringify(users));

    showAlert('signupAlert', '회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.', 'success');
    
    // 폼 초기화
    document.getElementById('signupFormElement').reset();
    
    // 2초 후 로그인 페이지로 이동
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 2000);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 회원가입 폼 이벤트 리스너
    document.getElementById('signupFormElement').addEventListener('submit', handleSignup);
});