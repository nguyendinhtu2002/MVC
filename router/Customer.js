const express = require("express");
const { register, Login, getHome, Logout } = require("../controller/CustomerController");
const router = express.Router();
const store = require("../middlerware/multer");

router.get("/register", (req, res) => {
  if(req.session.user){
    return res.redirect('/')
  }
  res.render("register_customer");
});
router.post("/register", store.single("profilePicture"), register);
router.get("/login", getHome);
router.post("/login", Login);
router.post("/logout", Logout);

module.exports = router;
