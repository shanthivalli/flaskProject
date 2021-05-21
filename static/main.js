const bookInfo = document.getElementById("book-info");
const booksTable = document.getElementById("books")
let nextCursor;
let scrollIsActive = false;
let timesEditClicked = 0;
let onLoad;

document.addEventListener("DOMContentLoaded", onLoad = () => {
    console.log("hii")
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        bookInfo.innerHTML = "";
        paginate(data);
        console.log("first", nextCursor);
        console.log("data");
    };
    xhr.open('GET', 'http://127.0.0.1:5000/v1/books', true);
    xhr.send();
});


function onFormSubmit(){
    if(validate()){
        book_name = document.getElementById("book_name").value;
        author_name = document.getElementById("author_name").value;
        isbn = document.getElementById("isbn").value;
        let xhr = new XMLHttpRequest();
        xhr.onload = function(){
            let res = JSON.parse(xhr.responseText);
            console.log(res);
            onLoad();
        }
        xhr.open('POST', 'http://127.0.0.1:5000/v1/forms', true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify({"book_name": book_name, "author_name": author_name, "isbn": isbn }));
        resetForm();
    }
}


function resetForm(){
    document.getElementById("book_name").value = "";
    document.getElementById("author_name").value = "";
    document.getElementById("isbn").value = "";
}


function paginate(data){
    console.log(scrollIsActive)
    if(!document.getElementById("loader").classList.contains('hide')){
        document.getElementById("loader").classList.add('hide');
    }
    let disString = ``;
    console.log(data);
    books = data["books"];
    function createRow(book,index){
        disString += `
            <tr id="${book.book_id}">
                <td>${book.book_id}</td>
                <td title="book_name">${book.book_name}</td>
                <td title="author_name">${book.author_name}</td>
                <td title="isbn">${book.isbn}</td>
                <td><img id="edit-icon" src="static/edit-icon.png" onclick="edit(this)"></td>
                <td><button style="display: inline-block" id="del-btn" onclick="del(this)">Delete</button></td>
            </tr>`
    };
    books.forEach(createRow);
    nextCursor = data["next_cursor"];
    bookInfo.insertAdjacentHTML('beforeend', disString);
    console.log("height", booksTable.offsetHeight);
    scrollIsActive = false;
}


booksTable.addEventListener('scroll',()=>{
    console.log("inside scroll", scrollIsActive)
    console.log("top",booksTable.scrollTop);
    console.log("height",booksTable.scrollHeight)
    if (!scrollIsActive && booksTable.offsetHeight + booksTable.scrollTop >= booksTable.scrollHeight){
        scrollIsActive = true;
        showLoading();
    }
});


function showLoading(){
    document.getElementById("loader").classList.remove('hide');
    if(nextCursor !== null){
        setTimeout(nextPage(nextCursor), 1000);
    }
    else{
        document.getElementById("loader").classList.add('hide');
    }
}


function nextPage(currCursor){
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        paginate(data);
        console.log(data);
    };
    xhr.open('GET', 'http://127.0.0.1:5000/v1/books?cursor='+currCursor, true);
    xhr.send();
}


function edit(data){
    timesEditClicked += 1;
    let editObj = {};
    elements = data.parentElement.parentElement.childNodes;
    console.log("inside edit1");
    if(timesEditClicked === 1){
        data.style.opacity = "0.5";
        for(x of elements){
            if(x.title === "book_name" || x.title === "author_name" || x.title === "isbn")
                x.contentEditable=true;
        }
    }
    else{
        data.style.opacity = "1";
        timesEditClicked = 0;
        for(x of elements){
            if(x.title === "book_name" || x.title === "author_name" || x.title === "isbn"){
                x.contentEditable=false;
                editObj[x.title] = x.innerHTML;
            }
        }
        let xhr = new XMLHttpRequest();
        xhr.onload = function(){
            let res = JSON.parse(xhr.responseText);
            console.log(res);
        }
        xhr.open('PUT', 'http://127.0.0.1:5000/v1/books/'+x.parentElement.id, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhr.send(JSON.stringify(editObj));
    }
}


function del(data){
    console.log("inside delete");
    console.log(data.parentElement.parentElement.id)
    if(confirm("Are you sure to delete this record?")){
        let xhr = new XMLHttpRequest();
        xhr.onload = function(){
            let res = JSON.parse(xhr.responseText);
            console.log(res);
        }
        xhr.open('DELETE', 'http://127.0.0.1:5000/v1/books/'+data.parentElement.parentElement.id, true);
        xhr.send();
        data.parentElement.parentElement.remove();
    }
}


function validate(){
    isValid = true;
    if(document.getElementById("book_name").value === "" || document.getElementById("author_name").value === "" || document.getElementById("isbn").value === ""){
        isValid = false;
        document.getElementById("validationError").innerHTML = "All the fields are required";
    }
    else{
        document.getElementById("validationError").innerHTML = "";
    }
    return isValid;
}