const API_BASE_URL = 'http://localhost:8080';
let editingBookId = null;

const bookForm = document.getElementById('bookForm');
const bookTableBody = document.getElementById('bookTableBody');
const cancelButton = bookForm.querySelector('.cancel-btn');
const submitButton = bookForm.querySelector('button[type="submit"]');

document.addEventListener('DOMContentLoaded', () => {
    loadBooks();
});

bookForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(bookForm);
    
    const bookData = {
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        isbn: formData.get('isbn').trim(),
        price: formData.get('price') ? parseInt(formData.get('price')) : null,
        publishDate: formData.get('publishDate') || null,
        detailRequest: {
            description: formData.get('description').trim(),
            language: formData.get('language').trim(),
            pageCount: formData.get('pageCount') ? parseInt(formData.get('pageCount')) : null,
            publisher: formData.get('publisher').trim(),
            coverImageUrl: formData.get('coverImageUrl').trim(),
            edition: formData.get('edition').trim()
        }
    };

    if (!validateBook(bookData)) return;

    if (editingBookId) {
        updateBook(editingBookId, bookData);
    } else {
        createBook(bookData);
    }
});

function validateBook(book) {
    if (!book.title) {
        alert('제목을 입력해주세요.');
        return false;
    }
    if (!book.author) {
        alert('저자를 입력해주세요.');
        return false;
    }
    if (!book.isbn) {
        alert('ISBN을 입력해주세요.');
        return false;
    }
    if (!book.price || book.price < 0) {
        alert('유효한 가격을 입력해주세요.');
        return false;
    }

    const isbnPattern = /^[0-9X-]+$/;
    if (!isbnPattern.test(book.isbn)) {
        alert('올바른 ISBN 형식이 아닙니다.');
        return false;
    }

    if (book.detailRequest.coverImageUrl && !isValidUrl(book.detailRequest.coverImageUrl)) {
        alert('올바른 이미지 URL 형식이 아닙니다.');
        return false;
    }

    return true;
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        return false;
    }
}

function loadBooks() {
    fetch(`${API_BASE_URL}/api/books`)
        .then(response => response.json())
        .then(books => renderBookTable(books))
        .catch(error => {
            console.error('Error:', error);
            alert('도서 목록을 불러오는데 실패했습니다.');
        });
}

function renderBookTable(books) {
    bookTableBody.innerHTML = '';
    books.forEach(book => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${book.title}</td>
            <td>${book.author}</td>
            <td>${book.isbn}</td>
            <td>${book.price?.toLocaleString() ?? '-'}</td>
            <td>${book.publishDate || '-'}</td>
            <td>${book.detail?.publisher || '-'}</td>
            <td>
                <button class="edit-btn" onclick="editBook(${book.id})">수정</button>
                <button class="delete-btn" onclick="deleteBook(${book.id})">삭제</button>
            </td>
        `;
        bookTableBody.appendChild(row);
    });
}

function createBook(bookData) {
    fetch(`${API_BASE_URL}/api/books`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bookData)
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || '도서 등록 실패');
        }
        return response.json();
    })
    .then(() => {
        alert('도서가 등록되었습니다!');
        resetForm();
        loadBooks();
    })
    .catch(error => {
        alert(error.message);
        console.error('Error:', error);
    });
}

function deleteBook(bookId) {
    if (!confirm(`ID: ${bookId} 도서를 삭제하시겠습니까?`)) return;
    
    fetch(`${API_BASE_URL}/api/books/${bookId}`, {
        method: 'DELETE'
    })
    .then(() => {
        alert('도서가 삭제되었습니다!');
        loadBooks();
    })
    .catch(error => {
        alert('삭제 실패: ' + error.message);
        console.error('Error:', error);
    });
}

function editBook(bookId) {
    fetch(`${API_BASE_URL}/api/books/${bookId}`)
    .then(response => response.json())
    .then(book => {
        bookForm.title.value = book.title;
        bookForm.author.value = book.author;
        bookForm.isbn.value = book.isbn;
        bookForm.price.value = book.price;
        bookForm.publishDate.value = book.publishDate || '';
        
        if (book.detail) {
            bookForm.description.value = book.detail.description || '';
            bookForm.language.value = book.detail.language || '';
            bookForm.pageCount.value = book.detail.pageCount || '';
            bookForm.publisher.value = book.detail.publisher || '';
            bookForm.coverImageUrl.value = book.detail.coverImageUrl || '';
            bookForm.edition.value = book.detail.edition || '';
        }

        editingBookId = bookId;
        submitButton.textContent = "도서 수정";
        cancelButton.style.display = 'inline-block';
    })
    .catch(error => {
        alert('도서 정보 불러오기 실패: ' + error.message);
        console.error('Error:', error);
    });
}

function updateBook(bookId, bookData) {
    fetch(`${API_BASE_URL}/api/books/${bookId}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(bookData)
    })
    .then(() => {
        alert('도서가 수정되었습니다!');
        resetForm();
        loadBooks();
    })
    .catch(error => {
        alert('수정 실패: ' + error.message);
        console.error('Error:', error);
    });
}

function resetForm() {
    bookForm.reset();
    editingBookId = null;
    submitButton.textContent = "도서 등록";
    cancelButton.style.display = 'none';
}