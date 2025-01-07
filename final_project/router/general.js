const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    if (isValid(username)) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users[username] = { password };

    res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop

const getBooks = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(books);
        }, 1000);
    });
};

public_users.get('/', async (req, res) => {
   try {
        const booksList = await getBooks();
        res.status(200).json(booksList);
   } catch (error) {
        console.error("Error getting book:", error);
        res.status(500).json({ message: "Error getting books"})
   }
});

const getBookByISBN = (isbn) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const book = books.find(book => book.isbn === isbn);
            if (book) {
                resolve(book);
            } else {
            reject(new Error('Book not found'));
        }
        }, 1000);
    });
};

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const book = await getBookByISBN(isbn);
        res.status(200).json(book);
    } catch (error) {
        console.error("Error getting book:", error);
        res.status(404).json({ meesage: "Book not found" });
    }
});

const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByAuthor = books.filter(book => book.author === author);
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
            reject(new Error('Books not found'));
        }
        }, 1000);
    });
};  
// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const books = await getBooksByAuthor(author);
        res.status(200).json(books);
    } catch (error) {
        console.error("Error getting books:", error);
        res.status(404).json({ meesage: "Books not found" });
    }
});

const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const booksByTitle = books.filter(book => book.title === title);
            if (booksByTitle.length > 0) {
                resolve(booksByTitle);
            } else {
            reject(new Error('Books not found'));
        }
        }, 1000);
    });
}; 

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title;
    try {
        const books = await getBooksByTitle(title);
        res.status(200).json(books);
    } catch (error) {
        console.error("Error getting books:", error);
        res.status(404).json({ message: "Books not found" });
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
