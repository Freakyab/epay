const express = require("express");
const router = express.Router();
const Transaction = require("../models/transaction.model");
const Product = require("../models/products.model");
const Address = require("../models/address.model");

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid user id" });
    }
    const transactions = await Transaction.find({
      userId: userId,
      status: "Completed",
    }).sort({
      createdAt: -1,
    });

    const orderDetails = await Promise.all(
      transactions.map(async (transaction) => {
        const items = await Promise.all(
          transaction.products.map(async (product) => {
            const productsDetails = await Product.findById(product.productId);
            return {
              _id: product.productId,
              name: productsDetails.name,
              price: productsDetails.price,
              image: productsDetails.image,
              seller: productsDetails.brand,
            };
          })
        );
        return {
          orderId: transaction._id,
          date: transaction.createdAt.toDateString(),
          total: transaction.price,
          status: transaction.status,
          uid: transaction.uid,
          items: items,
        };
      })
    );

    if (!orderDetails) {
      return res.status(400).json({
        success: false,
        message: "No orders found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Fetched orders successfully",
      orderDetails: orderDetails,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/invoice/:uid", async (req, res) => {
  try {
    const transactionUid = req.params.uid;

    if (!transactionUid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid transaction id" });
    }

    const transaction = await Transaction.findOne({
      uid: transactionUid,
    });

    const productDetails = await Product.find({
      _id: { $in: transaction.products.map((p) => p.productId) },
    });

    const addressDetails = await Address.findById(transaction.addressId);

    if (!transaction) {
      return res.json({
        success: false,
        message: "Transaction not found",
      });
    }

    return res.json({
      success: true,
      products: productDetails,
      transactionDetails: transaction,
      addressDetails,
      message: "Fetched transaction details successfully",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
