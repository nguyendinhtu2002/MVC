const express = require("express")
const { createDistribution } = require("../controller/DistributionController")
const router = express.Router()


router.post("/",createDistribution)

module.exports = router

