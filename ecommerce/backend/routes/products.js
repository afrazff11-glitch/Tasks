const router = require("express").Router();
const Product = require("../models/Product");

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "Could not load products" });
  }
});

// Add product
router.post("/", async (req, res) => {
  try {
    const { name, price, description, image, category, stock } = req.body;

    if (!name || !price || !description || !image) {
      return res.status(400).json({ message: "Name, price, description, and image are required" });
    }

    const product = await Product.create({
      name,
      price,
      description,
      image,
      category: category || "General",
      stock: stock || 0
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: "Could not add product" });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: "Invalid product id" });
  }
});

module.exports = router;
