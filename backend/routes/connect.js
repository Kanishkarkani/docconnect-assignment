
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User");
const Connection = require("../models/Connection");

router.post("/", async (req, res) => {
  try {
    const { fromUserId, toUserId } = req.body;

    if (
      !mongoose.isValidObjectId(fromUserId) ||
      !mongoose.isValidObjectId(toUserId)
    ) {
      return res.status(400).json({
        message: "Valid fromUserId and toUserId are required"
      });
    }

    if (fromUserId === toUserId) {
      return res.status(400).json({
        message: "You cannot connect to yourself"
      });
    }

    const users = await User.find({
      _id: { $in: [fromUserId, toUserId] }
    });

    if (users.length !== 2) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const existing = await Connection.findOne({
      fromUser: fromUserId,
      toUser: toUserId
    });

    if (existing) {
      return res.status(200).json({
        message: "Request already exists",
        requested: true
      });
    }

    await Connection.create({
      fromUser: fromUserId,
      toUser: toUserId
    });

    res.status(201).json({
      message: "Connection request saved",
      requested: true
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({
        message: "Request already exists",
        requested: true
      });
    }

    console.error("Connection request failed:", error.message);
    res.status(500).json({
      message: "Failed to save connection request"
    });
  }
});

module.exports = router;
