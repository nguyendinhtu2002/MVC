const express = require("express");
const { register, Login, Logout, updateProfile } = require("../controller/CustomerController");
const router = express.Router();
const store = require("../middlerware/multer");

router.get("/register", (req, res) => {
  if(req.session.user){
    return res.redirect('/')
  }
  res.render("register_customer");
});
router.post("/register", store.single("profilePicture"), register);
router.post("/login", Login);
router.post("/logout", Logout);
router.post("/updateProfile",store.single("profilePicture"),updateProfile);
module.exports = router;
