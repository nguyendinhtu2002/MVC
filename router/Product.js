const express = require("express");
const { getDetailsProduct, checkOut, findByProduct, listAll, getDetailsProductApi } = require("../controller/ProductController");
const { checkAuth, checkAuthAPI } = require("../middlerware/AuthMiddlerware");
const router = express.Router();

router.get("/orders",checkOut)
router.get("/:id",getDetailsProduct)
router.get('/v1/search',findByProduct)
router.get("/getAll/product",listAll)
router.get("/getDetailsProductApi/:id",getDetailsProductApi)
module.exports = router