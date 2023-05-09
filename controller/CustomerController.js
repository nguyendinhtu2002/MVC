const Customer = require("../model/Customer");
const Joi = require("joi");
const expressAsyncHandler = require("express-async-handler");
const fs = require("fs");
const { generateToken, refreshToken } = require("../utils/generateToken");

const getHome = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  return res.render("login_customer");
};
const register = async (req, res, next) => {
  const files = req.file;
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
    name: Joi.string().required(),
    address: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.render("register_customer", {
      message: error.details[0].message,
    });
  }
  try {
    const { username, password, profile_picture, name, address } = req.body;

    const existingCustomer = await Customer.findOne({ username });
    if (existingCustomer) {
      return res.render("register_customer", {
        message: "Username is already taken",
      });
    }
    let img = fs.readFileSync(req.file.path);
    const encode_image = img.toString("base64");
    const customer = new Customer({
      username,
      password,
      filename: files.originalname,
      contentType: files.mimetype,
      imageBase64: encode_image,
      name,
      address,
    });

    await customer.save();

    return res.render(
      "register_customer",
      {
        message: "Customer account created successfully",
      },
      (err) => {
        res.redirect("/customer/login");
      }
    );
  } catch (error) {
    console.log(error);
    return res.render("register_customer", {
      message: "Internal server error",
    });
  }
};
const Login = expressAsyncHandler(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const customer = await Customer.findOne({ username });
    if (customer && (await customer.matchPassword(password))) {
      req.session.user = {
        id: customer._id,
        type: "Customer",
      };
      req.session.isLoggedInCustomer = true;

      const message = "Customer logged in successfully";
      return res.render("login_customer", { message }, (err, html) => {
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
    console.log(error);

    const message = "Internal server error";
    return res.render("login_vendor", { message });
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
    res.redirect("/customer/login");
  });
});
module.exports = { register, Login, getHome, Logout };
