// form.js 구조 확장
const API_BASE_URL = "http://localhost:8080/api/books";

// 상세 유효성 검사 추가
function validateBook(book) {
    const isbnPattern = /^(?:\d{3}-)?\d{10}$/;
    if (!isbnPattern.test(book.isbn)) {
        alert('올바른 ISBN 형식이 아닙니다');
        return false;
    }
    return true;
}

// 상세 정보 팝업 기능 추가
function showDetail(bookId) {
    fetch(`${API_BASE_URL}/${bookId}`)
        .then(res => res.json())
        .then(book => {
            // 모달 창에 상세 정보 표시
        });
}