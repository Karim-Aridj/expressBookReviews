const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // returns boolean: username must be a non-empty string
    return typeof username === 'string' && username.length > 0;
};

const authenticatedUser = (username, password) => {
    // returns boolean: check if username and password match our records
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    return validusers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in: missing credentials" });
    }

    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({ data: password }, 'access', { expiresIn: 60 * 60 });

        // Store token + username in session
        req.session.authorization = { accessToken, username };
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password then try again" });
    }
});

// Add / modify a book review (protected route)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (!review) {
        return res.status(200).json(books[isbn].reviews);
    }

    books[isbn].reviews[username] = review;
    return res.status(200).json({
        message: `Review added/updated for book ${isbn}`,
        reviews: books[isbn].reviews
    });
});

// Delete a book review (protected route)
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    if (books[isbn].reviews[username]) {
        delete books[isbn].reviews[username];
        return res.status(200).json({
            message: `Review deleted for book ${isbn}`,
            reviews: books[isbn].reviews
        });
    } else {
        return res.status(404).json({ message: "No review found for this user on this book" });
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
