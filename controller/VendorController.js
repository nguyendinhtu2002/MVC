const Vendor = require("../model/Vendor");
const Joi = require("joi");
const expressAsyncHandler = require("express-async-handler");
const { generateToken, refreshToken } = require("../utils/generateToken");
const jwt_decode = require("jwt-decode");
const fs = require("fs");

const getRegister = (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  res.render("register_vendor");
};
const getHome = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  return res.render("login_vendor");
};
const register = async (req, res, next) => {
  const files = req.file;
  if (!files) {
    return res.render("register_vendor", { message: "File is missing" });
  }
  const schema = Joi.object({
    username: Joi.string()
      .pattern(/^[a-zA-Z0-9]+$/)
      .required()
      .messages({
        "string.pattern.base":
          "Username must contain only letters and digits, and have a length between 8 and 15 characters",
      }),
    password: Joi.string()
      .pattern(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/
      )
      .required()
      .messages({
        "string.pattern.base":
          "Password must contain at least one uppercase letter, one lowercase letter, one digit, one special character from the set !@#$%^&*, and have a length between 8 and 20 characters",
        "any.required": "Password is required",
      }),
    profile_picture: Joi.string(),
    business_name: Joi.string().required(),
    business_address: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.render("register_vendor", {
      message: error.details[0].message,
    });
  }
  try {
    const { username, password, business_name, business_address } = req.body;

    const existingVendor = await Vendor.findOne({ username });
    if (existingVendor) {
      return res.render("register_vendor", {
        message: "Username is already taken",
      });
    }

    const existingBusiness = await Vendor.findOne({
      business_name,
      business_address,
    });
    if (existingBusiness) {
      return res.render("register_vendor", {
        message:
          "Business name and address are already taken by another vendor",
      });
    }
    let img = fs.readFileSync(req.file.path);
    const encode_image = img.toString("base64");

    const vendor = new Vendor({
      username,
      password,
      filename: files.originalname,
      contentType: files.mimetype,
      imageBase64: encode_image,
      business_name,
      business_address,
    });

    await vendor.save();

    return res.render(
      "register_vendor",
      {
        message: "Vendor account created successfully",
      },
      (err) => {
        res.redirect("/vendor/login");
      }
    );
  } catch (error) {
    console.error(error);
    return res.render("register_vendor", {
      message: "Internal server error",
    });
  }
};
const Login = expressAsyncHandler(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const vendor = await Vendor.findOne({ username });
    if (vendor && (await vendor.matchPassword(password))) {
      req.session.user = {
        id: vendor._id,
        type: "Vendor",
      };
      req.session.isLoggedInVendor = true;
      const message = "Success";

      return res.render("login_vendor", { message }, (err, html) => {
        if (err) {
          // console.error(err);
          return res.status(500).send("Internal server error");
        }
        res.redirect("/");
      });
    } else {
      const message = "Invalid username or password";
      return res.render("login_vendor", { message });
    }
  } catch (error) {
    const message = "Internal server error";
    return res.render("login_vendor", { message });
  }
});

const getSingleVendor = expressAsyncHandler(async (req, res, next) => {
  try {
    // console.log(req.user)
    const vendor = await Vendor.findById(req.session.user.id).lean();
    if (vendor) {
      return res.render("vendor_info", { vendor });
    }
  } catch (error) {
    console.log(error);
    const message = "Internal server error";
    return res.render("vendor_info", { message });
  }
});
const Logout = expressAsyncHandler(async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.render("register_vendor", {
        message: "Internal server error",
      });
    }
    res.clearCookie("connect.sid");
    res.redirect("/vendor/login");
  });
});
const updatePicture = expressAsyncHandler(async (req, res, next) => {
  const files = req.file;
  if (!files) {
    return res.render("vendor_info", { message: "File is missing" });
  }
  try {
    const vendor = await Vendor.findById(req.session.user.id);
    if (vendor) {
      // Update the profile picture
      let img = fs.readFileSync(req.file.path);
      const encode_image = img.toString("base64");

      vendor.filename = files.originalname;
      vendor.contentType = files.mimetype;
      vendor.imageBase64 = encode_image;

      await vendor.save();

      req.session.message = "Profile picture updated successfully";
      req.session.messageType = "success";
      return res.redirect("/vendor/profile");
    } else {
      return res.render("vendor_info", { message: "Vendor not found" });
    }
  } catch (error) {
    console.error(error);
    req.session.message = "Internal server error";
    req.session.messageType = "error";
    return res.redirect("/vendor/profile");
  }
});

module.exports = {
  register,
  Login,
  getRegister,
  getHome,
  getSingleVendor,
  Logout,
  updatePicture,
};
