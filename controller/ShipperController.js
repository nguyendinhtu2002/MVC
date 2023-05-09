const Shipper = require("../model/Shipper");
const Joi = require("joi");
const expressAsyncHandler = require("express-async-handler");
const { generateToken, refreshToken } = require("../utils/generateToken");
const fs = require("fs");
const Order = require("../model/Orders")


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
    distributionHub: Joi.string().required(),
  });
  const { error } = schema.validate(req.body);
  if (error) {
    return res.render("register_shipper", {
      message: error.details[0].message,
    });
  }
  try {
    const { username, password, distributionHub } = req.body;

    const existingShipper = await Shipper.findOne({ username });
    if (existingShipper) {
      return res.render("register_shipper", {
        message: "Username is already taken",
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
        res.redirect("/shipper/login");
      }
    );
  } catch (error) {
    console.log(error);
    return res.render("register_shipper", {
      message: "Internal server error",
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
      return res.render("login_shipper", { message }, (err, html) => {
        if (err) {
          // console.error(err);
          return res.status(500).send("Internal server error");
        }
        res.redirect("/");
      });
    } else {
      const message = "Invalid username or password";
      return res.render("login_shipper", { message });
    }
  } catch (error) {
    console.log(error);
    const message = "Internal server error";
    return res.render("login_shipper", { message });
  }
});
const getHome = async (req, res) => {
  if (req.session.user) {
    return res.redirect("/");
  }
  return res.render("login_shipper");
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
    res.redirect("/shipper/login");
  });
});

const getAll = async (req, res, next) => {
  const shipper = await Shipper.findOne({ _id: req.session.user.id }).lean();
  if(shipper){
    const data = await Order.find({ "distributionHub": shipper.distributionHub }).lean()
    if(data){
      return res.render("shipper_order",{data})
    }
    else{
      return res.render("shipper_order",{message:"Khong co san pham nao"})

    }
  }
  else{
    return res.render("shipper_order",{message:"Chua login"})
  }

}

const getbyId = async(req,res,next)=>{
   const data = await Order.findById(req.params.id)
   if(data){
    return res.json(data)
   }
   else{
    return res.json({message:"Khong co san pham nao"})
   }
}
module.exports = { register, Login, getHome, Logout, getAll,getbyId };
