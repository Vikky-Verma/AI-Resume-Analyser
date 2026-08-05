const {
  listPosts,
  createPost,
  deletePost,
  toggleLike,
  listComments,
  addComment,
  deleteComment,
} = require("../services/communityService");

const getPosts = async (req, res) => {
  try {
    const { cursor, limit } = req.query;
    const posts = await listPosts(req.user.id, {
      cursor: cursor || undefined,
      limit: limit ? Math.min(Number(limit), 50) : 20,
    });
    return res.status(200).json({ success: true, data: { posts } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to load community posts" });
  }
};

const addPost = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Post content is required" });
    }
    if (content.length > 2000) {
      return res.status(400).json({ success: false, message: "Post is too long (max 2000 characters)" });
    }

    const post = await createPost(req.user.id, content.trim());
    return res.status(201).json({ success: true, data: { post } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to create post" });
  }
};

const removePost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await deletePost(req.user.id, id);

    if (!result) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to delete post" });
  }
};

const likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await toggleLike(req.user.id, id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    return res.status(200).json({ success: true, data: { post } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to update like" });
  }
};

const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await listComments(id);
    return res.status(200).json({ success: true, data: { comments } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to load comments" });
  }
};

const addPostComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: "Comment content is required" });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, message: "Comment is too long (max 1000 characters)" });
    }

    const comment = await addComment(req.user.id, id, content.trim());

    if (!comment) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }
    return res.status(201).json({ success: true, data: { comment } });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};

const removeComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const result = await deleteComment(req.user.id, commentId);

    if (!result) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to delete comment" });
  }
};

module.exports = {
  getPosts,
  addPost,
  removePost,
  likePost,
  getComments,
  addPostComment,
  removeComment,
};