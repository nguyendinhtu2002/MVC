const jwt = require("jsonwebtoken");
const Vendor = require("../model/Vendor");
const checkAuth = (req, res, next) => {
  // Nếu session chưa tồn tại user hoặc user chưa đăng nhập, chuyển hướng người dùng về trang đăng nhập
  if (!req.session.user) {
    return res.redirect("/vendor/login");
  }

  next();
};
const checkVendor = (req, res, next) => {
  // Nếu session không tồn tại user hoặc user không phải là vendor, chuyển hướng người dùng về trang đăng nhập
  if (!req.session.user || req.session.user.type !== "Vendor") {
    return res.redirect("/vendor/login");
  }

  next();
};
const checkShipper = (req, res, next) => {
  // Nếu session không tồn tại user hoặc user không phải là vendor, chuyển hướng người dùng về trang đăng nhập
  if (!req.session.user || req.session.user.type !== "Shipper") {
    return res.redirect("/shipper/login");
  }

  next();
};
const checkCustomer = (req, res, next) => {
  // Nếu session không tồn tại user hoặc user không phải là vendor, chuyển hướng người dùng về trang đăng nhập
  if (!req.session.user || req.session.user.type !== "Customer") {
    return res.redirect("/customer/login");
  }

  next();
};

module.exports = {
  checkAuth,
  checkVendor,
  checkShipper,
  checkCustomer
};
