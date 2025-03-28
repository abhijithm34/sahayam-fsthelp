const express = require("express");
const fs = require("fs");
const app = express();
const PORT = 3000;

app.use(express.static(__dirname)); // Serves `index1.html`
app.use(express.json());

const PRODUCTS_FILE = "products.json";
const CART_FILE = "cart.json";

// Read JSON file
const readData = (file) => {
    try {
        return JSON.parse(fs.readFileSync(file, "utf8")) || [];
    } catch (error) {
        return [];
    }
};

// Write JSON file
const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

// Get all products
app.get("/products", (req, res) => {
    res.json(readData(PRODUCTS_FILE));
});

// Get cart items
app.get("/cart", (req, res) => {
    res.json(readData(CART_FILE));
});

// Add item to cart (or increase quantity if exists)
app.post("/cart", (req, res) => {
    let cart = readData(CART_FILE);
    const { id, name, price, image } = req.body;

    let item = cart.find((product) => product.id === id);
    if (item) {
        item.quantity += 1;
    } else {
        cart.push({ id, name, price, image, quantity: 1 });
    }

    writeData(CART_FILE, cart);
    res.json(cart);
});

// Decrease quantity (or remove if 0)
app.put("/cart/decrease/:id", (req, res) => {
    let cart = readData(CART_FILE);
    const itemIndex = cart.findIndex((item) => item.id === req.params.id);

    if (itemIndex !== -1) {
        cart[itemIndex].quantity -= 1;
        if (cart[itemIndex].quantity === 0) {
            cart.splice(itemIndex, 1); // Remove item if quantity reaches 0
        }
    }

    writeData(CART_FILE, cart);
    res.json(cart);
});

// Remove item from cart
app.delete("/cart/:id", (req, res) => {
    let cart = readData(CART_FILE);
    cart = cart.filter((item) => item.id !== req.params.id);
    writeData(CART_FILE, cart);
    res.json(cart);
});

app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
