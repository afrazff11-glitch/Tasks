const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        name: String,
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],
    customer: {
      fullName: String,
      address: String,
      phone: String
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    status: {
      type: String,
      default: "Processing"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
