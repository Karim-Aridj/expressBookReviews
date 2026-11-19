const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    if (!isValid(username)) {
        return res.status(400).json({ message: "Invalid username" });
    }
    const exists = users.some(u => u.username === username);
    if (exists) {
        return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ username, password });
    return res.status(201).json({ message: `${username} successfully registered` });
});

// Helper to fetch books via Axios using async/await
async function getBooksList() {
    try {
        const response = await axios.get('http://localhost:5000/books');
        return response.data;
    } catch (error) {
        return books;
    }
}

async function getBookByISBN(isbn) {
    try {
        const response = await axios.get(`http://localhost:5000/books/isbn/${isbn}`);
        return response.data;
    } catch (error) {
        return books[isbn] || null;
    }
}

async function getBooksByAuthor(author) {
    try {
        const response = await axios.get(`http://localhost:5000/books/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        let filtered = [];
        for (let key in books) {
            if (books[key].author.toLowerCase() === author.toLowerCase()) {
                filtered.push(books[key]);
            }
        }
        return filtered;
    }
}

async function getBooksByTitle(title) {
    try {
        const response = await axios.get(`http://localhost:5000/books/title/${encodeURIComponent(title)}`);
        return response.data;
    } catch (error) {
        let filtered = [];
        for (let key in books) {
            if (books[key].title.toLowerCase() === title.toLowerCase()) {
                filtered.push(books[key]);
            }
        }
        return filtered;
    }
}

// Task 10: Get all books using async/await with Axios
public_users.get('/', async function (req, res) {
    const result = await getBooksList();
    return res.status(200).json(result);
});

// Task 11: Get book details by ISBN using async/await with Axios
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
    const result = await getBookByISBN(isbn);
    if (result) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

// Task 12: Get book details by Author using async/await with Axios
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
    const result = await getBooksByAuthor(author);
    if (result.length > 0) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Task 13: Get book details by Title using async/await with Axios
public_users.get('/title/:title', async function (req, res) {
    const title = req.params.title;
    const result = await getBooksByTitle(title);
    if (result.length > 0) {
        return res.status(200).json(result);
    } else {
        return res.status(404).json({ message: "No books found for this title" });
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;
    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
