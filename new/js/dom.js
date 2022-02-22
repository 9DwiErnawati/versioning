document.addEventListener("DOMContentLoaded", function ()
{
    const submit = document.getElementById("self");

    submit.addEventListener("submit", function (event)
	{
        event.preventDefault();
        addBook();
    });

	if(isStorageExist())
	{
	loadDataFromStorage();
	}
});

document.addEventListener("ondatasaved", () =>
{
	console.log("Data di simpan.");
});

document.addEventListener("ondataloaded", () =>
{
	refreshDataFromBooks();
});

const UNCOMPLETED_LIST_BOOK_ID = "books";
const COMPLETED_LIST_BOOK_ID = "completed-books";
const BOOK_ITEMID = "itemId";

function addBook()
{
    const uncompletedBOOKList = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
	const textCode = document.getElementById("code").value;
    const textTitle = document.getElementById("title").value;
    const textAuthor = document.getElementById("author").value;
    const timestamp = document.getElementById("date").value;

    const book = makeBook(textCode, textTitle, textAuthor, timestamp, false);
	const bookObject = composeBookObject(textCode, textTitle, textAuthor, timestamp, false);

	book[BOOK_ITEMID] = bookObject.id;
	books.push(bookObject);

    uncompletedBOOKList.append(book);
	updateDataToStorage();
}

function makeBook(code, jdl, tls, timestamp, isCompleted)
{
    const textCode = document.createElement("h2");
    textCode.innerText = code;

    const textTitle = document.createElement("p");
    textTitle.innerText = jdl;

    const textAuthor = document.createElement("p1");
    textAuthor.innerText = tls;

    const textTimestamp = document.createElement("div");
    textTimestamp.innerText = timestamp;

    const textContainer = document.createElement("div");
    textContainer.classList.add("inner")
    textContainer.append(textCode, textTitle, textAuthor, textTimestamp);

    const container = document.createElement("div");
    container.classList.add("item", "shadow")
    container.append(textContainer);

    if(isCompleted)
	{
        container.append
		(
            createUndoButton(),
            createTrashButton()
        );
    }
	else
	{
        container.append
		(
            createRedoButton(),
            createTrashButton()
        );
    }

    return container;
}

function createUndoButton()
{
    return createButton("undo-button", function(event)
	{
        undoTaskFromCompleted(event.target.parentElement);
    });
}

function createRedoButton()
{
    return createButton("redo-button", function(event)
	{
        redoTaskFromUncompleted(event.target.parentElement);
    });
}

function createTrashButton()
{
    return createButton("trash-button", function(event)
	{
        removeTaskFromCompleted(event.target.parentElement);
    });
}

function createButton(buttonClass, eventListener)
{
    const button = document.createElement("button");
    button.classList.add(buttonClass);
    button.addEventListener("click", function (event)
	{
        eventListener(event);
    });
    return button;
}


function addTaskToCompleted(taskElement)
{
    const listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);
    const taskCode = taskElement.querySelector(".inner > h2").innerText;
    const taskTitle = taskElement.querySelector(".inner > p").innerText;
    const taskAuthor = taskElement.querySelector(".inner > p1").innerText;
    const taskTimestamp = taskElement.querySelector(".inner > div").innerText;

    const newBook = makeBook(taskCode, taskTitle, taskAuthor, taskTimestamp, true);

	const book = findBook(taskElement[BOOK_ITEMID]);
	book.isCompleted = true;
	newBook[BOOK_ITEMID] = book.id;

    listCompleted.append(newBook);
    taskElement.remove();

	updateDataToStorage();
}

function removeTaskFromCompleted(taskElement)
{
	const bookPosition = findBookIndex(taskElement[BOOK_ITEMID]);
	books.splice(bookPosition, 1);

    taskElement.remove();
	alert("Menghapus data buku");
	updateDataToStorage();
}

function undoTaskFromCompleted(taskElement)
{
    const listUncompleted = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
    const taskCode = taskElement.querySelector(".inner > h2").innerText;
    const taskTitle = taskElement.querySelector(".inner > p").innerText;
    const taskAuthor = taskElement.querySelector(".inner > p1").innerText;
    const taskTimestamp = taskElement.querySelector(".inner > div").innerText;

    const newBook = makeBook(taskCode, taskTitle, taskAuthor, taskTimestamp, false);

	const book = findBook(taskElement[BOOK_ITEMID]);
	book.isCompleted = false;
	newBook[BOOK_ITEMID] = book.id;

    listUncompleted.append(newBook);
    taskElement.remove();

	updateDataToStorage();
}

function redoTaskFromUncompleted(taskElement)
{
    const listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);
    const taskCode = taskElement.querySelector(".inner > h2").innerText;
    const taskTitle = taskElement.querySelector(".inner > p").innerText;
    const taskAuthor = taskElement.querySelector(".inner > p1").innerText;
    const taskTimestamp = taskElement.querySelector(".inner > div").innerText;

    const newBook = makeBook(taskCode, taskTitle, taskAuthor, taskTimestamp, true);

	const book = findBook(taskElement[BOOK_ITEMID]);
	book.isCompleted = true;
	newBook[BOOK_ITEMID] = book.id;

    listCompleted.append(newBook);
    taskElement.remove();

	updateDataToStorage();
}

function refreshDataFromBooks()
{
	const listUncompleted = document.getElementById(UNCOMPLETED_LIST_BOOK_ID);
	let listCompleted = document.getElementById(COMPLETED_LIST_BOOK_ID);

	for(book of books)
	{
		const newBook = makeBook(book.code, book.task, book.author, book.timestamp, book.isCompleted);
		newBook[BOOK_ITEMID] = book.id;

		if(book.isCompleted){
			listCompleted.append(newBook);
		}else{
			listUncompleted.append(newBook);
		}
	}
}

const STORAGE_KEY = "BOOKSHELF_APPS";
let books = [];

function isStorageExist(){
    if(typeof(Storage) === undefined){
        alert("Browser tidak mendukung");
        return false
    }
    return true;
}

function saveData() {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event("ondatasaved"));
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if(data !== null)
        books = data;
    document.dispatchEvent(new Event("ondataloaded"));
}

function updateDataToStorage() {
    if(isStorageExist())
        saveData();
}

function findBook(bookId) {
    for(book of books){
        if(book.id === bookId)
            return book;
    }
    return null;
}

function findBookIndex(bookId) {
    let index = 0
    for (book of books) {
        if(book.id === bookId)
            return index;
        index++;
    }
    return -1;
}

function composeBookObject(code, task, author, timestamp, isCompleted) {
    return {
        id: +new Date(),
        code,
        task,
        author,
        timestamp,
        isCompleted
    };
}



