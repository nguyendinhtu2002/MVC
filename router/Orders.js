const express = require("express");
const {createOrder, deleteCart} = require("../controller/Order");
const { checkCustomer, checkAuth } = require("../middlerware/AuthMiddlerware");
const router = express.Router();


router.post("/orders",checkAuth,checkCustomer,createOrder)
router.delete("/deleteCart",deleteCart)

module.exports= router