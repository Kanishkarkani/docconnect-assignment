
const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const User = require("../models/User");
const Connection = require("../models/Connection");
const toPublicUrl = require("../utils/publicUrl");

router.get("/", async (req, res) => {
  try {
    const { currentUserId } = req.query;

    if (!currentUserId ||
        !mongoose.isValidObjectId(currentUserId)) {
      return res.status(400).json({
        message: "A valid currentUserId is required"
      });
    }

    const users = await User.find({
      _id: { $ne: currentUserId }
    })
      .select("name occupation profileImage")
      .lean();

    // Count connection requests each user is part of (sent or received).
    const connections = await Connection.find().select("fromUser toUser").lean();

    const usersWithDetails = users.map(user => {
      const id = user._id.toString();

      return {
        ...user,
        profileImage: toPublicUrl(req, user.profileImage),
        connectionCount: connections.filter(
          c => c.fromUser.toString() === id || c.toUser.toString() === id
        ).length
      };
    });

    const requests = await Connection.find({
      fromUser: currentUserId
    }).select("toUser");

    const requestedUserIds = requests.map(
      request => request.toUser.toString()
    );

    res.json({ users: usersWithDetails, requestedUserIds });
  } catch (error) {
    console.error("Failed to fetch users:", error.message);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

module.exports = router;
