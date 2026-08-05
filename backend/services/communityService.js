const prisma = require("../utils/prisma");

const POST_SELECT = (currentUserId) => ({
  id: true,
  content: true,
  likedBy: true,
  createdAt: true,
  updatedAt: true,
  user: { select: { id: true, name: true } },
  _count: { select: { comments: true } },
});

const shapePost = (post, currentUserId) => ({
  id: post.id,
  content: post.content,
  createdAt: post.createdAt,
  updatedAt: post.updatedAt,
  author: post.user,
  likeCount: post.likedBy.length,
  likedByMe: post.likedBy.includes(currentUserId),
  commentCount: post._count.comments,
});

const listPosts = async (currentUserId, { cursor, limit = 20 } = {}) => {
  const posts = await prisma.communityPost.findMany({
    take: limit,
    ...(cursor && { skip: 1, cursor: { id: cursor } }),
    orderBy: { createdAt: "desc" },
    select: POST_SELECT(currentUserId),
  });

  return posts.map((p) => shapePost(p, currentUserId));
};

const createPost = async (userId, content) => {
  const post = await prisma.communityPost.create({
    data: { userId, content },
    select: POST_SELECT(userId),
  });
  return shapePost(post, userId);
};

const getOwnedPost = async (postId) => {
  return prisma.communityPost.findUnique({ where: { id: postId } });
};

const deletePost = async (userId, postId) => {
  const existing = await getOwnedPost(postId);
  if (!existing || existing.userId !== userId) return null;

  await prisma.communityPost.delete({ where: { id: postId } });
  return true;
};

const toggleLike = async (userId, postId) => {
  const existing = await getOwnedPost(postId);
  if (!existing) return null;

  const alreadyLiked = existing.likedBy.includes(userId);
  const likedBy = alreadyLiked
    ? existing.likedBy.filter((id) => id !== userId)
    : [...existing.likedBy, userId];

  const post = await prisma.communityPost.update({
    where: { id: postId },
    data: { likedBy },
    select: POST_SELECT(userId),
  });

  return shapePost(post, userId);
};

const listComments = async (postId) => {
  const comments = await prisma.communityComment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });

  return comments.map((c) => ({
    id: c.id,
    content: c.content,
    createdAt: c.createdAt,
    author: c.user,
  }));
};

const addComment = async (userId, postId, content) => {
  const post = await getOwnedPost(postId);
  if (!post) return null;

  const comment = await prisma.communityComment.create({
    data: { userId, postId, content },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { id: true, name: true } },
    },
  });

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: comment.user,
  };
};

const deleteComment = async (userId, commentId) => {
  const existing = await prisma.communityComment.findUnique({
    where: { id: commentId },
  });
  if (!existing || existing.userId !== userId) return null;

  await prisma.communityComment.delete({ where: { id: commentId } });
  return true;
};

module.exports = {
  listPosts,
  createPost,
  deletePost,
  toggleLike,
  listComments,
  addComment,
  deleteComment,
  getOwnedPost,
};