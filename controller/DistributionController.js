const DistributionHub = require("../model/DistributionHub")
const Joi = require("joi");


const createDistribution = async (req, res, next) => {

    const schema = Joi.object({
        name: Joi.string().required(),
        address: Joi.string().required()
    })

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }
    try {
        const { name, address } = req.body;
        const checkName = await DistributionHub.findOne({ name })
        if (checkName) {
            return res.status(400).json({ message: "Name đã tồn tại" });
        }
        const checkAddress = await DistributionHub.findOne({ address })
        if (checkAddress) {
            return res.status(400).json({ message: "Address đã tồn tại" });
        }
        const newDistribution = new DistributionHub({
            name,
            address
        });
        await newDistribution.save();

        return res.status(200).json({ message: "Thanh cong", newDistribution })
    } catch (error) {
        next(error)
    }
}

const getRandom = async (req, res, next) => {
    try {
        const data = await DistributionHub.aggregate([{ $sample: { size: 1 } }])
        return res.json(data)
    } catch (error) {
        next(error)
    }
}
module.exports = { createDistribution,getRandom }