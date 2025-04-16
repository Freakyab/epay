const express = require("express");
const Cart = require("../models/cart.model");
const Products = require("../models/products.model");
const Address = require("../models/address.model");
const router = express.Router();

router.post("/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const { userId, quantity } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const product = await Products.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        productIds: [{ id: productId, quantity: quantity, selected: true }],
      });
    } else {
      // Find the product in the cart
      const existingProduct = cart.productIds.find(
        (item) => item.id === productId
      );

      if (existingProduct) {
        // Increment quantity
        existingProduct.quantity += quantity;
      } else {
        // Add new product to cart
        cart.productIds.push({ id: productId, quantity: 1, selected: true });
      }
    }

    // Save cart after modification
    await cart.save();

    return res.json({
      success: true,
      message: "Product added to cart successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error while adding product to cart",
    });
  }
});

router.get("/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const carts = await Cart.findOne({ userId }).populate("productIds.id");

    const allProducts = carts.productIds.map(async (item) => {
      const product = item.id;
      const productDetails = await Products.findById(product);
      return {
        product: productDetails,
        quantity: item.quantity,
        selected: item.selected,
      };
    });

    const products = await Promise.all(allProducts);

    const address = await Address.find({ userId });

    if (!carts) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }
    return res.json({
      success: true,
      data: products,
      address: address,
      message: "Cart fetched successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error while fetching cart",
    });
  }
});

router.put("/updateQuantity/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.body.userId;
    const quantity = req.body.quantity;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const cart = await Cart.findOne({
      userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the product in the cart
    const existingProduct = cart.productIds.find(
      (item) => item.id === productId
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Update quantity
    if (quantity === 0) {
      cart.productIds = cart.productIds.filter((item) => item.id !== productId);
    } else {
      existingProduct.quantity = quantity;
    }

    // Save cart after modification
    await cart.save();

    return res.json({
      success: true,
      message: "Quantity updated successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error while updating quantity",
    });
  }
});

router.put("/deleteItem/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.body.userId;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const cart = await Cart.findOne({
      userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the product in the cart
    const existingProduct = cart.productIds.find(
      (item) => item.id === productId
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // delete item
    cart.productIds = cart.productIds.filter((item) => item.id !== productId);

    // Save cart after modification
    await cart.save();

    return res.json({
      success: true,
      message: "Item deleted successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error while deleting item",
    });
  }
});

router.put("/updateSelected/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const userId = req.body.userId;
    const selected = req.body.selected;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Product ID is required",
      });
    }

    const cart = await Cart.findOne({
      userId,
    });

    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find the product in the cart
    const existingProduct = cart.productIds.find(
      (item) => item.id === productId
    );

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    // Update selected
    existingProduct.selected = selected;

    // Save cart after modification
    await cart.save();

    return res.json({
      success: true,
      message: "Selected updated successfully",
    });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({
      success: false,
      message: "Error while updating selected",
    });
  }
});

module.exports = router;
