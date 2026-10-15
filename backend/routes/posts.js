const express = require("express");
const router = express.Router();

const Post = require("../models/Post");
const User = require("../models/User");
const toPublicUrl = require("../utils/publicUrl");

// GET all posts
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name occupation profileImage")
      .sort({ timestamp: -1 })
      .lean();

    const postsWithUrls = posts.map(post => ({
      ...post,
      image: toPublicUrl(req, post.image),
      author: {
        ...post.author,
        profileImage: toPublicUrl(req, post.author.profileImage)
      }
    }));

    res.json(postsWithUrls);
  } catch (error) {
    console.error("Failed to fetch posts:", error.message);

    res.status(500).json({
      message: "Failed to fetch posts"
    });
  }
});

module.exports = router;