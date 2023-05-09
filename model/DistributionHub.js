const mongoose = require("mongoose");

const distributionHubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
  address: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
  },
},
{
  timestamps: true,
});

const DistributionHub = mongoose.model(
  "DistributionHub",
  distributionHubSchema
);

module.exports = DistributionHub;
