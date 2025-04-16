const mongoose = require("mongoose");
const client = require("../config");

const CartSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    productIds: {
      type: [
        {
          id: String,
          quantity: Number,
          selected : Boolean
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Cart = client.model("Cart", CartSchema);

module.exports = Cart;
