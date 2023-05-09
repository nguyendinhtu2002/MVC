const express = require("express");
const { getDetailsProduct, checkOut } = require("../controller/ProductController");
const router = express.Router();

router.get("/orders",checkOut)
router.get("/:id",getDetailsProduct)
module.exports = router