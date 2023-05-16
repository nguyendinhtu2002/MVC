const express = require("express");
const createOrder = require("../controller/Order");
const { checkCustomer, checkAuth } = require("../middlerware/AuthMiddlerware");
const router = express.Router();


router.post("/orders",checkAuth,checkCustomer,createOrder)


module.exports= router