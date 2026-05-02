const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const Product = require("./models/Product");

const app = express();

require("dotenv").config();

app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, "../frontend")));

const starterProducts = [
  {
    name: "Everyday Canvas Tote",
    price: 24.99,
    category: "Bags",
    stock: 18,
    description: "A sturdy cotton tote for books, market runs, and the tiny things that somehow travel with you every day.",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Ceramic Desk Mug",
    price: 14.5,
    category: "Home",
    stock: 30,
    description: "Warm off-white ceramic, comfortable handle, and just enough weight to feel like part of your morning routine.",
    image: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Linen Notebook Set",
    price: 18.75,
    category: "Stationery",
    stock: 22,
    description: "Three soft-cover notebooks with plain pages for planning, sketching, lists, and half-formed good ideas.",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Minimal Table Lamp",
    price: 42,
    category: "Home",
    stock: 11,
    description: "A small matte lamp with a warm glow, made for late-night reading and calmer desks.",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Recycled Steel Bottle",
    price: 19.99,
    category: "Kitchen",
    stock: 26,
    description: "A clean, leak-proof bottle that keeps water cold through commutes, workouts, and long study sessions.",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Wireless Desk Charger",
    price: 36,
    category: "Tech",
    stock: 14,
    description: "A slim charging pad for keeping your phone topped up without adding another messy cable to the desk.",
    image: "https://images.unsplash.com/photo-1615526675159-e248c3021d3f?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Cotton Throw Blanket",
    price: 39.5,
    category: "Home",
    stock: 9,
    description: "Soft, breathable cotton for sofa corners, evening movies, and rooms that need a little warmth.",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Bamboo Kitchen Board",
    price: 21.25,
    category: "Kitchen",
    stock: 19,
    description: "A simple bamboo board for chopping fruit, serving snacks, or making weekday cooking feel more organized.",
    image: "https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Travel Cable Pouch",
    price: 16.75,
    category: "Bags",
    stock: 24,
    description: "A compact pouch with enough pockets for chargers, earbuds, cards, and the cable you always need later.",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Amber Scent Candle",
    price: 12.25,
    category: "Home",
    stock: 35,
    description: "A small amber candle with a gentle, woody scent that works well on desks, shelves, and bedside tables.",
    image: "https://images.unsplash.com/photo-1602874801006-e26b1c0f8d8e?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Wooden Pen Holder",
    price: 11.5,
    category: "Stationery",
    stock: 28,
    description: "A neat wooden cup for pens, scissors, markers, and the small desk items that keep wandering off.",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=900&q=80"
  },
  {
    name: "Classic Wall Clock",
    price: 29,
    category: "Home",
    stock: 13,
    description: "A quiet wall clock with easy-to-read numbers and a simple face that fits most rooms without shouting.",
    image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=900&q=80"
  }
];

async function seedProducts() {
  await Promise.all(
    starterProducts.map((product) => {
      return Product.updateOne(
        { name: product.name },
        { $setOnInsert: product },
        { upsert: true }
      );
    })
  );

  console.log("Starter products checked");
}

mongoose.connect(process.env.MONGO_URI)
.then(async () => {
  console.log("MongoDB Connected");
  await seedProducts();
})
.catch(err => console.log(err));

app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));

app.listen(5000, () => console.log("Server running on port 5000"));
