const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const shipperSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 8,
      maxlength: 15,
    },
    password: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    imageBase64: {
      type: String,
      required: true,
    },
    distributionHub: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DistributionHub",
      required: true
    },
  },
  {
    timestamps: true,
  }
);

// Login
shipperSchema.methods.matchPassword = async function (enterPassword) {
  return await bcrypt.compare(enterPassword, this.password);
};

// Register
shipperSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});
const Shipper = mongoose.model("Shipper", shipperSchema);

module.exports = Shipper;
