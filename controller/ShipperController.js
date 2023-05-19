const Shipper = require("../model/Shipper");
const Joi = require("joi");
const expressAsyncHandler = require("express-async-handler");
const { generateToken, refreshToken } = require("../utils/generateToken");
const fs = require("fs");
const Order = require("../model/Orders");
const Customer = require("../model/Customer");
const DistributionHub = require("../model/DistributionHub");


const register = async (req, res, next) => {
  const data = await DistributionHub.find({}).lean();

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
    distributionHub: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    const errors = {};
    error.details.forEach((err) => {
      const path = err.path[0];
      errors[path] = true;
    });
    return res.render("register_shipper", {
      message: error.details[0].message,
      errors,
      data
    });
  }
  try {
    const { username, password, distributionHub } = req.body;

    const existingShipper = await Shipper.findOne({ username });
    if (existingShipper) {
      return res.render("register_shipper", {
        message: "Username is already taken",
        data
      });
    }

    let img = fs.readFileSync(req.file.path);
    const encode_image = img.toString("base64");
    const shipper = new Shipper({
      username,
      password,
      filename: files.originalname,
      contentType: files.mimetype,
      imageBase64: encode_image,
      distributionHub,
    });

    await shipper.save();

    return res.render(
      "register_shipper",
      {
        message: "Vendor account created successfully",
      },
      (err) => {
        return res.render("register_succes");
      }
    );
  } catch (error) {
    console.log(error);
    return res.render("register_shipper", {
      message: "Internal server error",
      data
    });
  }
};
const Login = expressAsyncHandler(async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const shipper = await Shipper.findOne({ username });
    if (shipper && (await shipper.matchPassword(password))) {
      req.session.user = {
        id: shipper._id,
        type: "Shipper",
      };
      req.session.isLoggedInShipper = true;
      const message = "Shipper logged in successfully";
      return res.render("login", { message }, (err, html) => {
        if (err) {
          // console.error(err);
          return res.status(500).send("Internal server error");
        }
        res.redirect("/");
      });
    } else {
      const message = "Invalid username or password";
      return res.render("login", { message });
    }
  } catch (error) {
    console.log(error);
    const message = "Internal server error";
    return res.render("login", { message });
  }
});
const getHome = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  return res.render("login");
};
const Logout = expressAsyncHandler(async (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.render("register_vendor", {
        message: "Internal server error",
      });
    }
    res.clearCookie("connect.sid");
    res.redirect("/login");
  });
});

const getAll = async (req, res, next) => {
  const shipper = await Shipper.findOne({ _id: req.session.user.id }).lean();
  if (shipper) {
    const data = await Order.find({ "distributionHub": shipper.distributionHub }).lean()
    const nameCustomer = await Customer.findOne({ _id: shipper.idUser }).lean()
    if (data) {
      return res.render("shipper_order", {
        data, nameCustomer, helpers: {
          formatDate: function (date) {
            const formattedDate = new Date(date).toISOString().split("T")[0];
            return formattedDate;
          }
        }
      })
    }
    else {
      return res.render("shipper_order", { message: "Khong co san pham nao" })

    }
  }
  else {
    return res.render("shipper_order", { message: "Chua login" })
  }

}

const getbyId = async (req, res, next) => {
  const data = await Order.findById(req.params.id).lean()
  if (data) {
    return res.render("details_order", { data })
  }
  else {
    return res.render("details_order", { message: "Khong tim thay san pham nao " })
  }
}

const updateProfile = expressAsyncHandler(async (req, res, next) => {
  const files = req.file;

  try {
    const { hub } = req.body;
    const shipper = await Shipper.findById(req.session.user.id);
    if (shipper) {
      // Update the profile picture
      if (files) {
        let img = fs.readFileSync(req.file.path);
        const encode_image = img.toString("base64");
        shipper.filename = files.originalname;
        shipper.contentType = files.mimetype;
        shipper.imageBase64 = encode_image;
      }
      if (hub !== "") {
        shipper.distributionHub = hub;
      }

      await shipper.save();
      req.session.message = "Profile picture updated successfully";
      req.session.messageType = "success";
      return res.redirect("/info");
    } else {
      return res.render("shipper_info", { message: "Shipper not found" });
    }
  } catch (error) {
    console.error(error);
    req.session.message = "Internal server error";
    req.session.messageType = "error";
    return res.redirect("/info");
  }
});

const updateStatus = expressAsyncHandler(async (req, res, next) => {
  try {
    const foundOrder = await Order.findById(req.body.id);
    if (foundOrder) {
      const { status } = req.body;
      foundOrder.status = status;
      await foundOrder.save();
      return res.json({ message: "Success" });
    } else {
      return res.json({ message: "Not Found id" });
    }
  } catch (error) {
    next(error);
  }
});
const changePassword = expressAsyncHandler(async (req, res, next) => {
  try {
    const passwordNew = await Shipper.findById(req.session.user.id);
    if (passwordNew) {
      const { passwordOld, password } = req.body;
      if (passwordOld && !passwordNew.matchPassword(passwordOld) && password) {
        return res.render("changePasswordShipper", {
          message: "Sai mat khau cũ",
          status: 0,
        });
      } else {
        passwordNew.password = password;
        await passwordNew.save();
        return res.render(
          "changePasswordShipper",
          {
            message: "Success",
            status: 1,
          },
          res.redirect("/")
        );
      }
    }
  } catch (error) {
    return res.render("changePasswordShipper", { message: "Co loi", status: 0 });
  }
});

module.exports = { register, Login, getHome, Logout, getAll, getbyId, updateProfile, updateStatus, changePassword };
