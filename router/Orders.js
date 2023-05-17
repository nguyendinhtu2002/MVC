const express = require("express");
const {createOrder, deleteCart} = require("../controller/Order");
const { checkCustomer, checkAuth, checkAuthAPI } = require("../middlerware/AuthMiddlerware");
const router = express.Router();


router.post("/orders",checkAuthAPI,createOrder)
router.delete("/deleteCart",deleteCart)

module.exports= router