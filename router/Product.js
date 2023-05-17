const express = require("express");
const { getDetailsProduct, checkOut, findByProduct } = require("../controller/ProductController");
const { checkAuth, checkAuthAPI } = require("../middlerware/AuthMiddlerware");
const router = express.Router();

router.get("/orders",checkOut)
router.get("/:id",getDetailsProduct)
router.get('/v1/search',findByProduct)
module.exports = router