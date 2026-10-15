const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  occupation: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model("User", userSchema);