const express = require("express")
const { createDistribution, getRandom } = require("../controller/DistributionController")
const router = express.Router()


router.post("/",createDistribution)
router.get("/",getRandom)
module.exports = router

