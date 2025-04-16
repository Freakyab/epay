const express = require("express");
const Products = require("../models/products.model");
const Reviews = require("../models/review.model");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const categories = await Products.find().distinct("category");

    // pick random products from each category and total must be equal to limit
    let products = [];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const categoryProducts = await Products.find({ category }).limit(5);
      products = products.concat(categoryProducts);
    }

    // shuffle products
    products = products.sort(() => Math.random() - 0.5);
    products = products.slice(0, limit);

    // return response
    return res.json({
      success: true,
      data: products,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Error while fetching data",
    });
  }
});

router.get("/category", async (req, res) => {
  try {
    const categories = await Products.find().distinct("category");
    return res.json({
      success: true,
      data: categories,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Error while fetching data",
    });
  }
});

router.get("/getProducts", async (req, res) => {
  try {
    const products = await Products.find().sort({ price: -1 });
    return res.json({
      success: true,
      data: products,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Error while fetching data",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!req.params.id) {
      return res.json({
        success: false,
        message: "Product id is required",
      });
    }
    let product = await Products.findById(req.params.id);

    const reviews = await Reviews.find({ productId: req.params.id }).sort({
      createdAt: -1,
    });

    if (reviews.length > 0) {
      product = { ...product._doc, reviews: reviews };
    }

    if (!product) {
      return res.json({
        success: false,
        message: "Product not found",
      });
    }
    return res.json({
      success: true,
      data: product,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Error while fetching data",
    });
  }
});

router.get("/search/:query", async (req, res) => {
  try {
    if (!req.params.query) {
      return res.json({
        success: false,
        message: "Search query is required",
      });
    }
    const query = req.params.query;
    const products = await Products.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { category: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }, // Optional: Add more fields to search
      ],
    }); // Exclude _id from the results if not needed

    if (products.length === 0) {
      return res.json({
        success: false,
        message: "No products found",
      });
    }

    return res.json({
      success: true,
      products,
      message: "Data fetched successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Error while fetching data",
    });
  }
});

router.post("/add/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.json({
        success: false,
        message: "User id is required",
      });
    }
    const { productDetails } = req.body;


    if (!productDetails) {
      return res.json({
        success: false,
        message: "Product details are required",
      });
    }
    
    const product = new Products({
      ...productDetails,
      userId,
    });

    await product.save();

    return res.json({
      success: true,
      data: product,
      message: "Product added successfully",
    });
  } catch (err) {
    console.log(err);
    return res.json({
      success: false,
      message: "Error while adding product",
    });
  }
});

module.exports = router;
