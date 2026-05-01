const router = require("express").Router();
const Order = require("../models/Order");
const Product = require("../models/Product");
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.replace("Bearer ", "");

    if (!token) return res.status(401).json({ message: "Please login first" });

    req.user = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid session" });
  }
};

// Place order
router.post("/", auth, async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const ids = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: ids } });

    const orderItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId);

      if (!product) {
        throw new Error("A product in your cart is no longer available");
      }

      return {
        productId: product._id,
        name: product.name,
        quantity: Number(item.quantity),
        price: product.price
      };
    });

    const total = orderItems.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);

    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      customer,
      total
    });

    await order.save();

    res.status(201).json({
      message: "Order placed successfully",
      orderId: order._id.toString(),
      total: order.total,
      order: {
        id: order._id.toString(),
        status: order.status
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "Order failed" });
  }
});

router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Could not load orders" });
  }
});

module.exports = router;
