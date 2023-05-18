const express = require("express");
const {
  register,
  Login,
  getRegister,
  getHome,
  Logout,
  updateProfile,
  changePassword,
} = require("../controller/VendorController");
const store = require("../middlerware/multer");
const { checkAuth, checkVendor } = require("../middlerware/AuthMiddlerware");
const {
  createProduct,
  getCreateProduct,
  listProduct,
  getUpdateProduct,
  deleteProduct,
  updateProduct,
} = require("../controller/ProductController");

const router = express.Router();
router.get("/register", getRegister);
router.get("/", getHome);
router.post("/register", store.single("profilePicture"), register);
router.get("/login", getHome);
router.post("/logout", Logout);
router.post("/change_profile", store.single("profilePicture"), updateProfile);
router.get("/create_product", checkAuth, checkVendor, getCreateProduct);
router.post(
  "/create_product",
  checkAuth,
  checkVendor,
  store.single("profilePicture"),
  createProduct
);
router.get("/list_product", checkAuth, checkVendor, listProduct);
router.get("/editProduct/:id", checkAuth, checkVendor, getUpdateProduct);
router.post(
  "/editProduct/:id",
  checkAuth,
  checkVendor,
  store.single("profilePicture"),
  updateProduct
);
router.post("/updatePassword", checkAuth, checkVendor, changePassword);
router.delete("/deleteProduct", checkAuth, checkVendor, deleteProduct);
module.exports = router;
