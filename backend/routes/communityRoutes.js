const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authMiddleware");

const {
  getPosts,
  addPost,
  removePost,
  likePost,
  getComments,
  addPostComment,
  removeComment,
} = require("../controllers/communityController");

router.get("/posts", authenticate, getPosts);
router.post("/posts", authenticate, addPost);
router.delete("/posts/:id", authenticate, removePost);
router.post("/posts/:id/like", authenticate, likePost);

router.get("/posts/:id/comments", authenticate, getComments);
router.post("/posts/:id/comments", authenticate, addPostComment);
router.delete("/comments/:commentId", authenticate, removeComment);

module.exports = router;