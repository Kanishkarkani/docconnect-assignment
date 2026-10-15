
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");
const Post = require("./models/Post");
const Connection = require("./models/Connection");

const users = [
  {
    name: "Arun Kumar",
    occupation: "Cardiologist",
    profileImage: "/images/profile/profile-1.png"
  },
  {
    name: "Priya Sharma",
    occupation: "Pediatrician",
    profileImage: "/images/profile/profile-2.png"
  },
  {
    name: "Rahul Menon",
    occupation: "General Physician",
    profileImage: "/images/profile/profile-3.png"
  },
  {
    name: "Sneha Reddy",
    occupation: "Registered Nurse",
    profileImage: "/images/profile/profile-4.png"
  },
  {
    name: "Vikram Patel",
    occupation: "Medical Student",
    profileImage: "/images/profile/profile-5.png"
  }
];

const postContents = [
  "Sharing some insights from today's cardiology conference.",
  "Early childhood care makes a lasting difference.",
  "A useful reminder to prioritize preventive healthcare.",
  "Grateful for the dedicated healthcare team I work with.",
  "Learning something new every day in medicine."
];

async function seedDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    // Remove previous assignment seed data.
    const oldUsers = await User.find({
      name: { $in: users.map(user => user.name) }
    }).select("_id");

    const oldUserIds = oldUsers.map(user => user._id);

    await Post.deleteMany({
      $or: [
        { author: { $in: oldUserIds } },
        { content: { $in: postContents } }
      ]
    });

    await Connection.deleteMany({
      $or: [
        { fromUser: { $in: oldUserIds } },
        { toUser: { $in: oldUserIds } }
      ]
    });

    await User.deleteMany({
      name: { $in: users.map(user => user.name) }
    });

    const insertedUsers = await User.insertMany(users);

    const posts = postContents.map((content, index) => ({
      content,
      author: insertedUsers[index]._id,
      image: `/images/posts/post-${index + 1}.png`,
      timestamp: new Date(Date.now() - index * 86400000)
    }));

    await Post.insertMany(posts);

    console.log(`Inserted ${insertedUsers.length} users`);
    console.log(`Inserted ${posts.length} posts`);
    console.log("Seed completed successfully");
    console.log(`Logged-in user (first seeded): ${insertedUsers[0].name}`);
    console.log(`Set CURRENT_USER_ID in mobile/src/constants/api.ts to: ${insertedUsers[0]._id}`);
  } catch (error) {
    console.error("Seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase();
