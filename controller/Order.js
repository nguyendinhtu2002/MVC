const Order = require("../model/Orders")


const createOrder = async (req, res) => {
    const { cart,distributionHub } = req.body;

    try {
        const total = cart.reduce((acc, product) => acc + product.price * product.quantity, 0);

        const order = await Order.create({
            cart,
            distributionHub,
            total
        });

        res.json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = createOrder