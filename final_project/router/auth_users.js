const express = require('express');
const jwt = require('jsonwebtoken');
const books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'user1', password: 'pass1' },
    { username: 'Arica', password: '1234!' }
];

const reviews = {};

const isValid = (username) => {
    const user = users[username]; // Retrieve the user object from the users collection
    return user !== undefined; // Check if the user exists
}

const authenticatedUser = (username, password) => {
    const user = users[username]; // Corrected from user[username] to users[username]
    return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    // Find the user by username
    const user = users.find(u => u.username === username);

    // Check if the user exists and the password matches
    if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }

    req.session.authorization = { username };

    // Generate a JWT token
    const token = jwt.sign({ username: user.username }, 'your_jwt_secret', { expiresIn: '60m' });

    res.status(200).json({ message: "Login successful", token });
});


// Add a book review
regd_users.post("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewContent = req.body.reviews;
    const username = req.user.username;

    if (!reviewContent) {
        return res.status(400).json({ message: "Review content is required" });
    }

    let bookReviews = reviews[isbn] || [];
    console.log(`Current reviews for ISBN ${isbn}:`, bookReviews);

    const existingReviewIndex = bookReviews.findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        bookReviews[existingReviewIndex].review = reviewContent;
        console.log(`Review updated by user ${username} for ISBN ${isbn}`);
        res.status(200).json({ message: "Review updated successfully" });
    } else {
        bookReviews.push({ username, review: reviewContent });
        reviews[isbn] = bookReviews;
        console.log(`Review added by user ${username} for ISBN ${isbn}`);
        res.status(201).json({ message: "Review added successfully" });
    }
});


regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username;

    const book = books.find(book => book.isbn === isbn);

    if (!book) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!book.reviews) {
        return res.status(404).json({ message: "No reviews found for this isbn." });
    }

    console.log(`Current reviews for ISBN ${isbn}:`, book.reviews)

    const bookReviews = Object.values(book.reviews);
    const reviewIndex = bookReviews.findIndex(r => r.username === username);

    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    bookReviews.splice(reviewIndex, 1); // Remove the review
    book.reviews = bookReviews.reduce((acc, review) => {
        acc[review.username] = review;
        return acc;
    }, {});

    res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
