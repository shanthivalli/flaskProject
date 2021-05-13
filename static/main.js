const display = document.getElementById("display");
const page_cont = document.getElementById("book-info");
let prev_cursors = [];
let s = false;
display.addEventListener("click", () => {
    console.log("hii")
    let xhr = new XMLHttpRequest();
    xhr.onload = function(){
        let data = JSON.parse(xhr.responseText);
        renderHTML(data);
        console.log("data");
    };
    xhr.open('GET', 'http://127.0.0.1:5000/v1/books', true);
    xhr.send();
});


function renderHTML(data){
    console.log(data);
    let disString = `
        <table border="1px solid black">
            <thead>
                <tr>
                    <th>BookId</th>
                    <th>BookName</th>
                    <th>AuthorName</th>
                    <th>ISBN</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `
    books = data["books"];
    function listFunc(book,index){
        disString += `
            <tr id="${book.book_id}">
                <td contenteditable="true">${book.book_id}</td>
                <td contenteditable="true">${book.book_name}</td>
                <td contenteditable="true">${book.author_name}</td>
                <td contenteditable="true">${book.isbn}</td>
                <td><button style="display: inline-block" id="del-btn">Delete</button></td>
            </tr>`
    };
    books.forEach(listFunc);
    disString+=`</tbody></table><button id="prev">Previous</button><button id="next">Next</button>`
    page_cont.innerHTML = disString;
    if(!data['more']){
        document.getElementById("next").disabled = true;
    }
    if(data['curr_cursor']===null){
        document.getElementById("prev").disabled = true;
    }
    document.getElementById("next").onclick = function() {next(data['next_cursor']);};
    prev_cursors.push(data['curr_cursor']);
    console.log(prev_cursors);
    document.getElementById("prev").onclick = function() {prev();};
    const editables = document.querySelectorAll("[contenteditable]");
};
function next(curr_cursor){
    let xhr1 = new XMLHttpRequest();
    xhr1.onload = function(){
        let data = JSON.parse(xhr1.responseText);
        renderHTML(data);
        console.log("data");
    };
    xhr1.open('GET', 'http://127.0.0.1:5000/v1/books?cursor='+curr_cursor, true);
    xhr1.send();
//    document.getElementById("next").onclick = ()=> false;
}

function prev(){
    prev_cursors.pop();
    curr_cursor = prev_cursors.pop();
    let xhr1 = new XMLHttpRequest();
    xhr1.onload = function(){
        let data = JSON.parse(xhr1.responseText);
        renderHTML(data);
        console.log("data");
    };
    if(curr_cursor!==null){
        xhr1.open('GET', 'http://127.0.0.1:5000/v1/books?cursor='+curr_cursor, true);
        xhr1.send();
    }
    else{
        xhr1.open('GET', 'http://127.0.0.1:5000/v1/books', true);
        xhr1.send();
    }
}