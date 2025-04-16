const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const client = require('./../config');

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = client.model("User", userSchema);

module.exports = User;
