const express = require("express");
const axios = require("axios");
const crypto = require("crypto");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const Transaction = require("../models/transaction.model");
const User = require("../models/user.model");
// const Address = require("../models/address.model");
const Product = require("../models/products.model");
const Cart = require("../models/cart.model");
const Address = require("../models/address.model");

// Constants
const salt_key = "96434309-7796-489d-8924-ab56988a6076";
const merchant_id = "PGTESTPAYUAT86";

router.post("/", async (req, res) => {
  try {
    const { userId, products, price, address } = req.body;
    let merchantTransactionId = "Tr-" + uuidv4().toString().slice(-6);

    if (!userId || !products || !price) {
      return res.json({
        success: false,
        message: "Please provide all details",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }
    const amount = Number(price).toFixed(0);
    console.log(amount);
    // Prepare the payload
    const data = {
      merchantId: merchant_id,
      merchantTransactionId: merchantTransactionId,
      name: user.name,
      amount: amount * 100,
      redirectUrl: `${process.env.NEXT_PUBLIC_API_URL}/status/${merchantTransactionId}`,
      redirectMode: "REDIRECT",
      callbackUrl: `${process.env.NEXT_PUBLIC_API_URL}/status/${merchantTransactionId}`,
      paymentInstrument: {
        type: "PAY_PAGE",
      },
    };

    // Encode payload as Base64
    const payload = JSON.stringify(data);
    const payloadMain = Buffer.from(payload).toString("base64");

    // Generate checksum
    const keyIndex = 1;
    const string = payloadMain + "/pg/v1/pay" + salt_key;
    const sha256 = crypto.createHash("sha256").update(string).digest("hex");
    const checksum = `${sha256}###${keyIndex}`;

    // Define PhonePe API URL
    const prod_URL =
      "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";

    // API call options
    const options = {
      method: "POST",
      url: prod_URL,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
      },
      data: {
        request: payloadMain,
      },
    };

    // Make the API call
    const response = await axios(options);
    if (response.data.data.instrumentResponse.redirectInfo.url) {
      const redirectUrl =
        response.data.data.instrumentResponse.redirectInfo.url;

      const exisitingAddress = await Address.findOne({
        userId,
        email: address.email,
      });
      let newAddress;
      
      if (!exisitingAddress) {
        newAddress = new Address({
          userId,
          ...address,
        });

        await newAddress.save();
      }

      // Save the transaction details
      const transaction = new Transaction({
        userId,
        products,
        price,
        transactionId: merchantTransactionId,
        status: "Pending",
        addressId: exisitingAddress ? exisitingAddress._id : newAddress._id,
      });

      await transaction.save();

      return res.json({
        success: true,
        message: "Payment processed successfully",
        redirectUrl,
      });
    }

    return res.json({
      success: false,
      message: "Error while processing payment",
    });
  } catch (err) {
    console.error(err);
    return res.json({
      success: false,
      message: "Error while processing payment",
    });
  }
});

router.post("/callback/:id", async (req, res) => {
  try {
    const merchantId = merchant_id;
    const transactionId = req.params.id;
    const userId = req.body.userId;

    const st = `/pg/v1/status/${merchantId}/${transactionId}` + salt_key;

    // Correcting the SHA256 hashing
    const dataSha256 = crypto.createHash("sha256").update(st).digest("hex");
    const checksum = `${dataSha256}###1`; // Key index should match the one used before

    const options = {
      method: "GET",
      url: `https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/status/${merchantId}/${transactionId}`,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": merchantId,
      },
    };

    const response = await axios.request(options);
    if (response.data.code === "PAYMENT_SUCCESS") {
      const transaction = await Transaction.findOne({
        transactionId,
      });

      transaction.status = "Completed";
      transaction.uid = response.data.data.transactionId;

      await transaction.save();

      const productDetails = await Product.find({
        _id: { $in: transaction.products.map((p) => p.productId) },
      });

      const cart = await Cart.findOneAndDelete({ userId });
      const addressDetails = await Address.findById(transaction.addressId);

      if (!cart) {
        return res.json({
          success: false,
          message: "Cart not found",
        });
      }

      return res.json({
        success: true,
        products: productDetails,
        transactionDetails: transaction,
        addressDetails,
        message: "Payment processed successfully",
      });
    } else {
      return res.json({
        success: false,
        message: "Payment failed",
      });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
