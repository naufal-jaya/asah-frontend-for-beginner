const books = [];
const RENDER_BOOK = 'render-book';
const STORAGE_KEY = 'Save_books';
const incompleteBookList = document.getElementById('incompleteBookList');
const completeBookList = document.getElementById('completeBookList');
const submitForm = document.getElementById('bookForm');
const searchForm = document.getElementById('searchBook');
const searchInput = document.getElementById('searchBookTitle');
const bookNotFound = 'Buku Tidak Ditemukan';

function generateID() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return {
        id,
        title,
        author,
        year,
        isComplete
    }
}

function findBook(bookId) {
    for (const book of books) {
        if (book.id === bookId) {
            return book;
        }
    }
    return null;
}

function isStorageAvailable() {
    if (typeof(Storage) === undefined) {
        alert('Browser ini tidak mendukung local storage');
        return false;
    }
    return true;
}

function saveData() {
    if (isStorageAvailable()) {
        const savedBooks = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, savedBooks);
    }
}

function loadStorageData() {
    const targetData = localStorage.getItem(STORAGE_KEY);
    let bookData = JSON.parse(targetData);

    if (bookData !== null) {
        for (const book of bookData) {
            books.push(book);
        }
    }
    document.dispatchEvent(new Event(RENDER_BOOK));
}

function addBook() {
    const bookTitle = document.getElementById('bookFormTitle').value;
    const bookAuthor = document.getElementById('bookFormAuthor').value;
    const bookYear = parseInt(document.getElementById('bookFormYear').value);
    const bookIsComplete = document.getElementById('bookFormIsComplete').checked;
    const bookID = generateID();
    const bookObject = generateBookObject(bookID, bookTitle, bookAuthor, bookYear, bookIsComplete);
    books.push(bookObject);
    return bookObject;
}

function displayBook(bookObject) {
    const oleh = document.createElement('p');
    oleh.innerText = 'oleh';
    const title = document.createElement('h3');
    title.innerText = bookObject.title;
    const author = document.createElement('p');
    author.innerText = bookObject.author;
    const divider = document.createElement('p');
    divider.innerText = '|';
    const year = document.createElement('p');
    year.innerText = bookObject.year;

    oleh.id = 'olehPenulis';
    title.setAttribute('data-testid', 'bookItemTitle');
    author.setAttribute('data-testid', 'bookItemAuthor');
    year.setAttribute('data-testid', 'bookItemYear');

    const btnIsComplete = document.createElement('button');
    btnIsComplete.innerText = bookObject.isComplete ? 'Tandai Belum Selesai' : 'Tandai Selesai';
    const btnDelete = document.createElement('button');
    btnDelete.innerText = 'Hapus Buku';
    const btnEdit = document.createElement('button');
    btnEdit.innerText = 'Edit detil';
    const ContainerButton = document.createElement('div');
    ContainerButton.append(btnIsComplete, btnDelete, btnEdit);

    const Container = document.createElement('div');
    Container.append(title, oleh, author, divider, year, ContainerButton);
    Container.setAttribute('data-bookid', bookObject.id);
    Container.setAttribute('data-testid', 'bookItem');
    btnIsComplete.setAttribute('data-testid', 'bookItemIsCompleteButton');
    btnDelete.setAttribute('data-testid', 'bookItemDeleteButton');
    btnEdit.setAttribute('data-testid', 'bookItemEditButton');

    btnIsComplete.addEventListener('click', function() {
        switchComplete(bookObject.id);
    });
    btnDelete.addEventListener('click', function() {
        removeBook(bookObject.id);
    });
    btnEdit.addEventListener('click', function() {
        editBook(bookObject.id);
    });

    return Container;
}

function switchComplete(bookId) {
    const bookItem = findBook(bookId);
    bookItem.isComplete = !bookItem.isComplete;
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveData();
}

function removeBook(bookId) {
    const bookIndex = books.findIndex(book => book.id === bookId);
    if (bookIndex !== -1) {
        books.splice(bookIndex, 1);
    }
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveData();
}

function editBook(bookId) {
    const bookItem = findBook(bookId);
    const bookElement = document.querySelector(`[data-bookId='${bookId}']`);
    const itemSelectors = `[data-testid="bookItemTitle"], p, div`;
    bookElement.querySelectorAll(itemSelectors).forEach(item => {
        item.innerHTML = '';
    });
    const editForm = document.createElement('form');
    editForm.id = 'editForm';
    const editTitle = document.createElement('input');
    editTitle.value = bookItem.title;
    const editAuthor = document.createElement('input');
    editAuthor.value = bookItem.author;
    const editYear = document.createElement('input');
    editYear.value = bookItem.year;
    const editSubmit = document.createElement('button');
    editSubmit.innerText = 'Terapkan perubahan';
    editForm.append(editTitle, editAuthor, editYear, editSubmit)
    bookElement.prepend(editForm);
    editForm.addEventListener('submit', function(event) {
        event.preventDefault();
        bookItem.title = editTitle.value;
        bookItem.author = editAuthor.value;
        bookItem.year = editYear.value;
        document.dispatchEvent(new Event(RENDER_BOOK));
        saveData();
    });
}

function checkBookTitle() {
    for (const book of books) {
        if (book.title.toLowerCase().includes(searchInput.value.toLowerCase())) {
            return book.id;
        }
    }
    return bookNotFound;
}

document.addEventListener('DOMContentLoaded', function() {
    loadStorageData();
});

document.addEventListener(RENDER_BOOK, function() {
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';
    for (const bookItem of books) {
        const bookElement = displayBook(bookItem);
        if (bookItem.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    }
});

submitForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const newBookObject = addBook();
    const newBookElement = displayBook(newBookObject);
    if (newBookObject.isComplete) {
        completeBookList.appendChild(newBookElement);
    } else {
        incompleteBookList.appendChild(newBookElement);
    }
    document.dispatchEvent(new Event(RENDER_BOOK));
    saveData();
});

searchForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const searchedBook = checkBookTitle();
    if (searchedBook == bookNotFound) {
        const notFoundElement = document.createElement('p');
        notFoundElement.innerText = bookNotFound;
        notFoundElement.id = 'notFoundText';
        setTimeout(() => {
            notFoundElement.remove();
        }, 2000);
        searchForm.append(notFoundElement);
    } else {
        const targetBook = document.querySelector(`[data-bookid="${searchedBook}"]`);
        targetBook.scrollIntoView({
            behavior: 'smooth'
        });
        const bookTitleElement = targetBook.querySelector('[data-testid="bookItemTitle"]');
        bookTitleElement.classList.add('searchHighlight');
        setTimeout(() => {
            bookTitleElement.classList.remove('searchHighlight');
        }, 2000);
    }
});