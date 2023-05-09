const Product = require("../model/Product");
const Joi = require("joi");
const fs = require("fs");
const DistributionHub = require("../model/DistributionHub")

const getCreateProduct = async (req, res, next) => {
  return res.render("add_product");
};
const createProduct = async (req, res, next) => {
  const files = req.file;
  if (!files) {
    return res.render("add_product", { message: "File is missing" });
  }
  const productSchema = Joi.object({
    name: Joi.string().min(10).max(20).required(),
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
    return res.render("list_product", { products,data });
  } else {
    return res.render("list_product", { message: "Khong co san pham nao" });
  }
};

const listAll = async (req, res, next) => {
  try {
    const products = await Product.find({}).lean();
    return res.render("homeCustomer", { products });
  } catch (error) {
    return res.render("homeCustomer", { message: "Error" });
  }
};

const getDetailsProduct = async (req, res, next) => {
  
  const product = await Product.findOne({_id:req.params.id}).lean();
  if(product){
    return res.render("details_product",{product})
  }
  else{
    return res.render("details_product",{message:"Khong tim thay san pham"})
  }
};

const checkOut  = async(req,res,next)=>{
  const data = await DistributionHub.find({}).lean();
  return res.render("checkout",{data})
}
module.exports = { createProduct, getCreateProduct, listProduct, listAll,getDetailsProduct,checkOut };
