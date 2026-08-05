import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Users,
  Send,
  Heart,
  MessageCircle,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

const Comments = ({ postId, onCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    let active = true;
    API.get(`/community/posts/${postId}/comments`)
      .then(({ data }) => {
        if (active) setComments(data.data.comments);
      })
      .catch(() => toast.error("Couldn't load comments"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setPosting(true);
    try {
      const { data } = await API.post(`/community/posts/${postId}/comments`, {
        content: text,
      });
      setComments((prev) => [...prev, data.data.comment]);
      onCountChange?.(1);
      setDraft("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't post comment");
    } finally {
      setPosting(false);
    }
  };

  const removeComment = async (commentId) => {
    try {
      await API.delete(`/community/comments/${commentId}`);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      onCountChange?.(-1);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete comment");
    }
  };

  return (
    <div className="mt-3 pt-3 border-t border-[#2e3150] flex flex-col gap-2.5">
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
          <Loader2 size={13} className="animate-spin" /> Loading comments…
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-slate-600 py-1">No comments yet — be the first.</p>
      ) : (
        comments.map((c) => (
          <div key={c.id} className="flex items-start justify-between gap-2 group">
            <div className="text-xs">
              <span className="font-semibold text-slate-300">{c.author.name}</span>{" "}
              <span className="text-slate-600">· {timeAgo(c.createdAt)}</span>
              <p className="text-slate-400 mt-0.5">{c.content}</p>
            </div>
            {c.author.id === user?.id && (
              <button
                onClick={() => removeComment(c.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 transition-opacity shrink-0"
                aria-label="Delete comment"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))
      )}

      <form onSubmit={submitComment} className="flex items-center gap-2 mt-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          type="text"
          placeholder="Write a reply…"
          maxLength={1000}
          className="flex-1 bg-[#0f1120] border border-[#2e3150] rounded-full px-3.5 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50"
        />
        <button
          type="submit"
          disabled={posting || !draft.trim()}
          className="w-8 h-8 shrink-0 rounded-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 flex items-center justify-center text-white transition-colors"
          aria-label="Reply"
        >
          {posting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
        </button>
      </form>
    </div>
  );
};

const PostCard = ({ post, onLike, onDelete }) => {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount);

  return (
    <div className="bg-[#171a2c] border border-[#2e3150] rounded-2xl p-5">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-white">{post.author.name}</p>
          <p className="text-xs text-slate-600">{timeAgo(post.createdAt)}</p>
        </div>
        {post.author.id === user?.id && (
          <button
            onClick={() => onDelete(post.id)}
            className="text-slate-600 hover:text-rose-400 transition-colors"
            aria-label="Delete post"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>

      <p className="text-sm text-slate-200 leading-relaxed mt-3 whitespace-pre-wrap">
        {post.content}
      </p>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => onLike(post.id)}
          className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
            post.likedByMe ? "text-rose-400" : "text-slate-500 hover:text-rose-400"
          }`}
        >
          <Heart size={14} fill={post.likedByMe ? "currentColor" : "none"} />
          {post.likeCount}
        </button>
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-400 transition-colors"
        >
          <MessageCircle size={14} />
          {commentCount}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {expanded && (
        <Comments
          postId={post.id}
          onCountChange={(delta) => setCommentCount((c) => c + delta)}
        />
      )}
    </div>
  );
};

const Community = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  const loadPosts = async () => {
    try {
      const { data } = await API.get("/community/posts");
      setPosts(data.data.posts);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't load the community feed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const submitPost = async (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setPosting(true);
    try {
      const { data } = await API.post("/community/posts", { content: text });
      setPosts((prev) => [data.data.post, ...prev]);
      setDraft("");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't post");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = async (postId) => {
    // optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              likedByMe: !p.likedByMe,
              likeCount: p.likeCount + (p.likedByMe ? -1 : 1),
            }
          : p
      )
    );
    try {
      const { data } = await API.post(`/community/posts/${postId}/like`);
      setPosts((prev) => prev.map((p) => (p.id === postId ? data.data.post : p)));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't update like");
      loadPosts();
    }
  };

  const handleDelete = async (postId) => {
    try {
      await API.delete(`/community/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Couldn't delete post");
    }
  };

  return (
    <div className="min-h-screen">
      <div className="pointer-events-none fixed -top-40 -left-40 w-[32rem] h-[32rem] bg-emerald-500/10 rounded-full blur-[120px]" />
      <div className="pointer-events-none fixed top-40 -right-32 w-[28rem] h-[28rem] bg-indigo-500/10 rounded-full blur-[120px]" />

      <div className="relative">

        <div className="max-w-2xl mx-auto px-6 py-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-5">
            <Users size={13} className="text-emerald-400" />
            <span className="text-emerald-300 text-xs font-semibold tracking-wide">
              Community
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Your corner.
          </h1>
          <p className="text-slate-400 text-sm mt-3 max-w-2xl leading-relaxed">
            Share a win, ask for feedback, or help someone else prep.
          </p>

          <form
            onSubmit={submitPost}
            className="mt-8 bg-[#171a2c] border border-[#2e3150] rounded-2xl p-4"
          >
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              maxLength={2000}
              className="w-full bg-[#0f1120] border border-[#2e3150] rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none"
            />
            <div className="flex justify-end mt-3">
              <button
                type="submit"
                disabled={posting || !draft.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                {posting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {posting ? "Posting…" : "Post"}
              </button>
            </div>
          </form>

          <div className="mt-6 flex flex-col gap-4">
            {loading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-slate-500 py-12">
                <Loader2 size={16} className="animate-spin" /> Loading feed…
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center text-sm text-slate-500 py-12">
                No posts yet — start the conversation.
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onLike={handleLike}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
