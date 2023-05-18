const Product = require("../model/Product");
const Joi = require("joi");
const fs = require("fs");
const DistributionHub = require("../model/DistributionHub");
const { findByIdAndDelete } = require("../model/Vendor");

const getCreateProduct = async (req, res, next) => {
  if (req.session.user) {
    return res.render("add_product");
  }
  return res.redirect("/login");
};
const getUpdateProduct = async (req, res, next) => {
  try {
    if (req.session.user) {
      const data = await Product.findById(req.params.id).lean();
      return res.render("edit_product", { data });
    }
    return res.redirect("/login");
  } catch (error) {}
};
const createProduct = async (req, res, next) => {
  const files = req.file;
  if (!files) {
    return res.render("add_product", { message: "File is missing" });
  }
  const productSchema = Joi.object({
    name: Joi.string().min(10).required(),
    price: Joi.number().min(1).required(),
    description: Joi.string().max(500),
  });
  const { error } = productSchema.validate(req.body);
  if (error) {
    return res.render("add_product", {
      message: error.details[0].message,
    });
  }
  try {
    let img = fs.readFileSync(req.file.path);
    const encode_image = img.toString("base64");
    const newProduct = new Product({
      name: req.body.name,
      price: req.body.price,
      filename: files.originalname,
      contentType: files.mimetype,
      imageBase64: encode_image,
      description: req.body.description,
      user: req.session.user.id,
    });
    await newProduct.save();
    return res.render(
      "add_product",
      {
        message: "Vendor account created successfully",
      },
      (err) => {
        res.redirect("/vendor/list_product");
      }
    );
  } catch (error) {
    console.error(error);
    return res.render("add_product", {
      message: "Internal server error",
    });
  }
};

const listProduct = async (req, res, next) => {
  const products = await Product.find({ user: req.session.user.id }).lean();
  const data = await DistributionHub.find({}).lean();
  if (products) {
    return res.render("list_product", { products, data });
  } else {
    return res.render("list_product", { message: "Khong co san pham nao" });
  }
};

const listAll = async (req, res, next) => {
  try {
    const products = await Product.find({}).lean();
    return res.json(products);
  } catch (error) {
    return res.render("homeCustomer", { message: "Error" });
  }
};

const getDetailsProduct = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id }).lean();
  if (product) {
    return res.render("details_product", { product });
  } else {
    return res.render("details_product", {
      message: "Khong tim thay san pham",
    });
  }
};

const checkOut = async (req, res, next) => {
  const data = await DistributionHub.find({}).lean();
  return res.render("checkout", { data });
};

const findByProduct = async (req, res, next) => {
  try {
    const query = req.query.query;
    const regex = new RegExp(query, "i");
    const products = await Product.find({ name: { $regex: regex } }).lean();
    return res.render("search", {
      products,
      helpers: {
        ifCond: function (v1, operator, v2, options) {
          switch (operator) {
            case "==":
              return v1 % v2 == 0 ? options.fn(this) : options.inverse(this);
            case "%":
              return (v1 + 1) % v2 == 0
                ? options.fn(this)
                : options.inverse(this);
            default:
              return options.inverse(this);
          }
        },
      },
    });
  } catch (error) {
    // console.log(error)
    return res.render("homeCustomer", { message: "Error" });

    // next(error);
  }
};
const deleteProduct = async (req, res, next) => {
  try {
    const productOld = await Product.findByIdAndDelete(req.body.id);
    if (productOld) {
      return res.json({ message: "thanh cong", ok: true });
    } else {
      return res.json({ message: "KHong tim thay id de xoa", ok: false });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const updateProduct = async (req, res, next) => {
  const files = req.file;
  try {
    const { description, price, name } = req.body;
    let product = await Product.findById(req.params.id);
    if (product) {
      if (files) {
        let img = fs.readFileSync(req.file.path);
        const encode_image = img.toString("base64");
        product.filename = files.originalname;
        product.contentType = files.mimetype;
        product.imageBase64 = encode_image;
      }

      // Update the properties
      product.name = name;
      product.description = description;
      product.price = price;

      // Save the changes to the database
      await product.save();

      return res.redirect("/vendor/list_product");
    } else {
      return res.render("edit_product", { message: "Product not found" });
    }
  } catch (error) {
    console.log(error);
    return res.render("edit_product", { message: "Some error occurred" });
  }
};

const getDetailsProductApi = async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id }).lean();
  if (product) {
    return res.json({ product });
  } else {
    return res.json({
      message: "Khong tim thay san pham",
    });
  }
};

module.exports = {
  createProduct,
  getCreateProduct,
  listProduct,
  listAll,
  getDetailsProduct,
  checkOut,
  findByProduct,
  getUpdateProduct,
  deleteProduct,
  updateProduct,
  getDetailsProductApi
};
