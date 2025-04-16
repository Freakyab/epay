const express = require("express");
const Reviews = require("../models/review.model");
const Products = require("../models/products.model");

const router = express.Router();

router.post("/generated/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide product ID",
      });
    }

    const { reviews } = req.body;

    if (!reviews) {
      return res.status(400).json({
        success: false,
        message: "Please provide reviews",
      });
    }

    const product = await Products.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviewData = reviews.map((review) => ({
      reviewerName: review.reviewerName,
      reviewerEmail: review.reviewerEmail,
      review: review.review,
      rating: review.rating,
      productId: id,
      createdAt: review.createdAt,
    }));

    const createdReviews = await Reviews.insertMany(reviewData);

    if (createdReviews.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to create reviews",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Reviews created successfully",
      data: createdReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const { reviewerName, reviewerEmail, review, rating, productId } = req.body;

    if (!reviewerName || !review || !rating || !productId) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required fields",
      });
    }

    const newReview = new Reviews({
      reviewerName,
      reviewerEmail,
      review,
      rating,
      productId,
      isVerified: true,
    });

    const savedReview = await newReview.save();

    if (!savedReview) {
      return res.status(400).json({
        success: false,
        message: "Failed to create review",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: savedReview,
    });
    
  } catch (error) {
    console.error(error);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;
