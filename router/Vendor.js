const express = require("express");
const {
  register,
  Login,
  getRegister,
  getHome,
  getSingleVendor,
  Logout,
  updatePicture,
} = require("../controller/VendorController");
const store = require("../middlerware/multer");
const { checkAuth, checkVendor } = require("../middlerware/AuthMiddlerware");
const {
  createProduct,
  getCreateProduct,
  listProduct,
} = require("../controller/ProductController");

const router = express.Router();
router.get("/register", getRegister);
router.get("/", getHome);
router.post("/register", store.single("profile_picture"), register);
router.get("/login", getHome);
router.post("/login", Login);
router.get("/profile", checkAuth, checkVendor, getSingleVendor);
router.post("/logout", Logout);
router.post("/change_profile", store.single("profile_picture"), updatePicture);
router.get("/create_product", checkAuth, checkVendor, getCreateProduct);
router.post("/create_product", store.single("profile_picture"), createProduct);
router.get('/list_product',listProduct)
module.exports = router;
