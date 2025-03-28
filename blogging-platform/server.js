const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");

const app = express();
const PORT = 3000;

const USERS_FILE = "users.json";
const BLOGS_FILE = "blogs.json";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname)); 

// Function to read and write users from JSON file
const getUsers = () => JSON.parse(fs.readFileSync(USERS_FILE, "utf8") || "{}");
const saveUsers = (users) => fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));

// Function to read and write blogs
const getBlogs = () => JSON.parse(fs.readFileSync(BLOGS_FILE, "utf8") || "[]");
const saveBlogs = (blogs) => fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogs, null, 2));

// Check if user is authenticated
const isAuthenticated = (req) => req.cookies && req.cookies.username && getUsers()[req.cookies.username];

// Home Route
app.get("/", (req, res) => {
    if (isAuthenticated(req)) {
        res.redirect("/dashboard");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

// Signup Route
app.post("/signup", (req, res) => {
    const { username, password } = req.body;
    let users = getUsers();

    if (users[username]) {
        return res.send("Username already exists! <a href='/'>Try again</a>");
    }

    users[username] = { password };
    saveUsers(users);

    res.cookie("username", username, { httpOnly: true });
    res.redirect("/dashboard");
});

// Login Route
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();

    if (!users[username] || users[username].password !== password) {
        return res.send("Invalid username or password. <a href='/'>Try again</a>");
    }

    res.cookie("username", username, { httpOnly: true });
    res.redirect("/dashboard");
});

// Logout Route
app.get("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect("/");
});

// Dashboard Route
app.get("/dashboard", (req, res) => {
    if (!isAuthenticated(req)) {
        return res.redirect("/");
    }
    res.sendFile(__dirname + "/dashboard.html");
});

// Get all blog posts
app.get("/blogs", (req, res) => {
    res.json(getBlogs());
});

// Add a new blog post
app.post("/blogs", (req, res) => {
    if (!isAuthenticated(req)) {
        return res.status(403).send("Unauthorized");
    }

    const blogs = getBlogs();
    const newPost = {
        username: req.cookies.username,
        title: req.body.title,
        content: req.body.content,
        date: new Date().toLocaleString(),
    };

    blogs.push(newPost);
    saveBlogs(blogs);

    res.json(newPost);
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
