const express = require("express");
const cors = require("cors");
const bodyPareser = require("body-parser");
const Products = require("./models/products.model");
const app = express();

const PORT = process.env.PORT | 8000;

app.use(bodyPareser.json());
app.use(cors());
app.use(express.json());

app.get("/",async (req, res) => {
  try {
    const products = await Products.find();

    const newProducts = products.map((product) => {
      return {
       ...product._doc,
       price : (product.price * 28.57).toFixed(2),
      };
    });

    await Products.deleteMany({});

    await Products.insertMany(newProducts);

    res.status(200).json({
      success: true,
      message: "Fetched products successfully",
      products: products,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


app.use("/products", require("./controllers/product.controller"));
app.use("/auth", require("./controllers/auth.controller"));
app.use("/cart", require("./controllers/cart.controller"));
app.use("/payment", require("./controllers/payment.controller"));
app.use("/orders", require("./controllers/orders.controller"));
// app.use("/wishlist", require("./controllers/wishlist.controller"));
app.use("/reviews", require("./controllers/review.controller"));

app.listen(PORT, async () => {
  console.log(`Listening on the port ${PORT}`);
});
