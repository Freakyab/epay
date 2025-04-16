const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const client = require("./../config");

const TransactionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    products: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        quantity: {
          type: Number,
          default: 1,
        },
      },
    ],
    price: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    uid: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      required: true,
      default: "pending",
    },
    addressId: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Transaction = client.model("Transaction", TransactionSchema);

module.exports = Transaction;
