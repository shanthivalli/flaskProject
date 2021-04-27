from flask import Flask, request, redirect, url_for, render_template, abort
import json
app = Flask(__name__)


@app.route('/')
def home():
    with open("static/data/db.json", 'r') as f1:
        data = json.load(f1)
    books_db = data
    return render_template('home.html', books=books_db)


@app.route('/display', methods=['POST'])
@app.route('/edit/display', methods=['POST'])
def display():
    with open("static/data/db.json", 'r') as f1:
        data = json.load(f1)
    books_db = data
    books_db.update({request.form.get('book_id'): {"book_name": request.form.get('book_name'),
                                                   "author_name": request.form.get('author_name'),
                                                   "isbn": request.form.get('isbn')}})
    with open("static/data/db.json", 'w') as f2:
        json.dump(books_db, f2)
    return redirect('/')


@app.route('/delete/<book_num>')
def delete(book_num):
    with open("static/data/db.json", 'r') as f1:
        data = json.load(f1)
    books_db = data
    x = books_db.pop(book_num)
    print(x)
    with open("static/data/db.json", 'w') as f2:
        json.dump(books_db, f2)
    return redirect('/')


@app.route('/edit/<book_num>')
def edit(book_num):
    f1 = open("static/data/db.json", 'r')
    data = json.load(f1)
    f1.close()
    books_db = data
    old_data = books_db.get(book_num)
    return render_template('edit.html', book_id=book_num, values=old_data)


if __name__ == '__main__':
    app.run(debug=True)
