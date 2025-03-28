const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const USERS_FILE = "users.json";

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname)); // Serve static files (from root folder)

// Function to read users from JSON file
function getUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
}

// Function to check if user is authenticated
const isAuthenticated = (req) => {
    const users = getUsers();
    return req.cookies && req.cookies.username && users[req.cookies.username];
};

// Home Route (Login Page)
app.get("/", (req, res) => {
    if (isAuthenticated(req)) {
        res.redirect("/dashboard");
    } else {
        res.sendFile(path.join(__dirname, "index.html"));
    }
});

// Login Route
app.post("/login", (req, res) => {
    const { username, password, remember } = req.body;
    const users = getUsers();

    if (!users[username] || users[username].password !== password) {
        return res.send("Invalid username or password. <a href='/'>Try again</a>");
    }

    // Set cookie for user authentication
    if (remember) {
        res.cookie("username", username, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: true });
    } else {
        res.cookie("username", username, { httpOnly: true });
    }

    res.redirect("/dashboard");
});

// Dashboard Route
app.get("/dashboard", (req, res) => {
    if (!isAuthenticated(req)) return res.redirect("/");

    res.sendFile(path.join(__dirname, "dashboard.html"));
});

// Logout Route
app.get("/logout", (req, res) => {
    res.clearCookie("username");
    res.redirect("/");
});

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
