const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    category: {
      type: String,
      default: "General"
    },
    stock: {
      type: Number,
      default: 20,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
