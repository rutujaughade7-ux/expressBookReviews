const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

// Promise-based lookups over the books database
const getBooks = () => new Promise((resolve) => resolve(books));

const findBooksBy = (field, value) =>
    getBooks().then((allBooks) =>
        Object.keys(allBooks)
            .filter((isbn) => allBooks[isbn][field].toLowerCase() === value.toLowerCase())
            .map((isbn) => ({ isbn, ...allBooks[isbn] }))
    );

public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (!isValid(username)) {
        return res.status(409).json({message: "User already exists!"});
    }

    users.push({ username, password });
    return res.status(200).json({message: "Customer successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
    const allBooks = await getBooks();
    return res.status(200).type('json').send(JSON.stringify(allBooks, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    getBooks()
        .then((allBooks) => {
            if (!allBooks[isbn]) {
                return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
            }
            return res.status(200).type('json').send(JSON.stringify(allBooks[isbn], null, 4));
        })
        .catch((err) => res.status(500).json({message: err.message}));
 });

// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const matches = await findBooksBy('author', req.params.author);

    if (matches.length === 0) {
        return res.status(404).json({message: `No books found for author ${req.params.author}`});
    }
    return res.status(200).type('json').send(JSON.stringify({booksbyauthor: matches}, null, 4));
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    const matches = await findBooksBy('title', req.params.title);

    if (matches.length === 0) {
        return res.status(404).json({message: `No books found with title ${req.params.title}`});
    }
    return res.status(200).type('json').send(JSON.stringify({booksbytitle: matches}, null, 4));
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (!books[isbn]) {
        return res.status(404).json({message: `Book with ISBN ${isbn} not found`});
    }
    return res.status(200).type('json').send(JSON.stringify(books[isbn].reviews, null, 4));
});

// ---------------------------------------------------------------------------
// Axios clients: retrieve books from the running server with promise callbacks
// or async/await.
// ---------------------------------------------------------------------------

// Get all books - async/await with Axios
const getAllBooksAsync = async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
};

// Get book details based on ISBN - promise callbacks with Axios
const getBookByISBN = (isbn) =>
    axios.get(`${BASE_URL}/isbn/${encodeURIComponent(isbn)}`)
        .then((response) => response.data)
        .catch((error) => {
            throw new Error(error.response ? error.response.data.message : error.message);
        });

// Get book details based on author - async/await with Axios
const getBooksByAuthor = async (author) => {
    try {
        const response = await axios.get(`${BASE_URL}/author/${encodeURIComponent(author)}`);
        return response.data;
    } catch (error) {
        throw new Error(error.response ? error.response.data.message : error.message);
    }
};

// Get book details based on title - promise callbacks with Axios
const getBooksByTitle = (title) =>
    axios.get(`${BASE_URL}/title/${encodeURIComponent(title)}`)
        .then((response) => response.data)
        .catch((error) => {
            throw new Error(error.response ? error.response.data.message : error.message);
        });

module.exports.general = public_users;
module.exports.getAllBooksAsync = getAllBooksAsync;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
