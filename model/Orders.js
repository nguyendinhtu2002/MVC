const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    cart: [
        {
            id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                require: true,
            },
            price: {
                type: Number,
                require: true,
            },
            quantity: {
                type: Number,
                require: true,
            },
        }
    ],
    total: {
        type: Number,
        require: true,
    },
    distributionHub: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "DistributionHub",
        required: true
    },
    addressShip:{
        type:String,
        require:true
    }

},
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
