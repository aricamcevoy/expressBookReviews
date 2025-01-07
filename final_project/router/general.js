const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  return res.status(300).json({message: "Yet to be implemented"});
});

// Get the book list available in the shop
public_users.get('/', (req, res) => {
    res.send(JSON.stringify(books, null, 4));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if (book) {
        res.json(book);
    } else {
        res.status(404).send('Book not found');
    }
});
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author;
    const booksByAuthor = books.filter(book => book.author === author);

    if (booksByAuthor.length > 0) {
        res.json(booksByAuthor);
    } else {
        res.status(404).send('Author not found');
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;
    const bookTitles = books.filter(book => book.title === title);

    if (bookTitles.length > 0) {
        res.json(bookTitles);
    } else {
        res.status(404).send('Title not found');
    }
});

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;
    const book = books.find(book => book.isbn === isbn);

    if (book) {
        res.json(book.reviews); // Return the reviews of the found book
    } else {
        res.status(404).send('No reviews found');
    }
});

module.exports.general = public_users;
