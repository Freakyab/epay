const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const client = require("./../config");

const reviewSchema = new Schema(
  {
    reviewerName: {
      type: String,
      required: true,
    },
    reviewerEmail: {
      type: String,
      required: false,
    },
    review: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const reviews = client.model("Reviews", reviewSchema);

module.exports = reviews;
