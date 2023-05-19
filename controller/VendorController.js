const Vendor = require("../model/Vendor");
const Joi = require("joi");
const expressAsyncHandler = require("express-async-handler");
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
  return res.render("login");
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
        res.render("register_succes");
      }
    );
  } catch (error) {
    console.error(error);
    return res.render("register_vendor", {
      message: "Internal server error",
    });
  }
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
const updateProfile = expressAsyncHandler(async (req, res, next) => {
  const files = req.file;

  try {
    const { business_name, business_address } = req.body;
    const vendor = await Vendor.findById(req.session.user.id);
    if (vendor) {
      // Update the profile picture
      if (files) {
        let img = fs.readFileSync(req.file.path);
        const encode_image = img.toString("base64");
        vendor.filename = files.originalname;
        vendor.contentType = files.mimetype;
        vendor.imageBase64 = encode_image;
      }
      if (business_name !== "") {
        vendor.business_name = business_name;
      }
      if (business_address !== "") {
        vendor.business_address = business_address;
      }
      await vendor.save();
      req.session.message = "Profile picture updated successfully";
      req.session.messageType = "success";
      return res.redirect("/info");
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

const changePassword = expressAsyncHandler(async (req, res, next) => {
  try {
    const passwordNew = await Vendor.findById(req.session.user.id);
    const { passwordOld, password } = req.body;
    if (passwordNew) {
      const tempt = await passwordNew.matchPassword(passwordOld)
      if (!tempt) {
        return res.render("changePasswordVendor", {
          message: "Sai mat khau cũ",
          status: 1,
        });
      } else {
        passwordNew.password = password;
        await passwordNew.save();
        // return res.render("changePasswordVendor", { message: "Thanh cong", status: 1 });
        return res.render(
          "changePasswordVendor",
          {
            message: "Success",
            status: 1,
          },
          res.redirect("/")
        );
      }
    }
  } catch (error) {
    return res.render("changePasswordVendor", { message: "Co loi", status: 0 });
  }
});
module.exports = {
  register,
  getRegister,
  getHome,
  Logout,
  updateProfile,
  changePassword,
};
