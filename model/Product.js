const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 20,
    },
    price: {
      type: Number,
      required: true,
      min: 1,
    },
    filename: {
      type: String,
      unique: true,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    imageBase64: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      maxlength: 500,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Vendor",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
