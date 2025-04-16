const mongoose = require("mongoose");
const client = require("../config");

const ProductsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    brand: {
      type: String,
      default: "",
    },
    weight: {
      type: Number,
    },
    rating: {
      type: {
        rate: Number,
        count: Number,
      },
      default: {
        rate: 3.5,
        count: 0,
      },
      required: true,
    },
    reviews: {
      type: [
        {
          rating: Number,
          comment: String,
          date: Date,
          reviewerName: String,
          reviewerEmail: String,
        },
      ],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const Products = client.model("Products", ProductsSchema);

module.exports = Products;
