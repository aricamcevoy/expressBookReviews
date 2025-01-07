const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
    { username: 'user1', password: 'pass1'},
    { username: 'Arica', password: '1234!'}
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
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Error logging in" });
    }

    if (authenticatedUser(username, password)) {
        // Generate a token
        const token = jwt.sign({ username }, "access", { expiresIn: '1h' });

        // Store the token in the session
        req.session.authorization = { accessToken: token };

        return res.status(200).json({ message: "User successfully logged in", token });
    } else {
        return res.status(401).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewContent = req.body.review;
    const username = req.session.authorization.username;

    if (!reviewContent) {
        return res.status(400).json({ message: "Review content is required" });
    }

    // Assuming you have a reviews object or database
    let bookReviews = reviews[isbn] || [];

    // Check if the user has already reviewed this book
    const existingReviewIndex = bookReviews.findIndex(r => r.username === username);

    if (existingReviewIndex !== -1) {
        // Modify existing review
        bookReviews[existingReviewIndex].review = reviewContent;
        res.status(200).json({ message: "Review updated successfully" });
    } else {
        res.status(404).json({ message: "Review not found for this user" });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!reviews[isbn]) {
        return res.status(404).json({ message: "No reviews found for this ISBN" });
    }

    const bookReviews = reviews[isbn];
    const reviewIndex = bookReviews.findIndex(r => r.username === username);

    if (reviewIndex === -1) {
        return res.status(404).json({ message: "Review not found for this user" });
    }

    bookReviews.splice(reviewIndex, 1); // Remove the review
    reviews[isbn] = bookReviews;

    res.status(200).json({ message: "Review deleted successfully" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
