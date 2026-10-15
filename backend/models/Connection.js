const mongoose = require("mongoose");

const connectionSchema = new mongoose.Schema({
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

connectionSchema.index(
  { fromUser: 1, toUser: 1 },
  { unique: true }
);

module.exports = mongoose.model("Connection", connectionSchema);