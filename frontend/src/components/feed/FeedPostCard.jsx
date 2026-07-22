import {
  Heart,
  MessageCircle,
  Clock3,
  Send,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

function FeedPostCard({
  post,
  likePost,
  commentText,
  setCommentText,
  addComment,
}) {
  const author = post.user?.name || "Developer";

  const avatarLetter = author.charAt(0).toUpperCase();

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-[#111827] transition-all duration-300 hover:-translate-y-1 hover:border-cyan-500/40 hover:shadow-2xl hover:shadow-cyan-500/10">

      {/* Header */}

      <div className="flex items-start justify-between border-b border-white/10 px-7 py-6">

        <div className="flex items-center gap-4">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-lg font-bold text-[#07131E] shadow-lg shadow-cyan-500/30">
            {avatarLetter}
          </div>

          <div>

            <div className="flex items-center gap-2">

              <h3 className="text-lg font-bold text-white">
                {author}
              </h3>

              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-cyan-300">
                Developer
              </span>

            </div>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-400">

              <div className="flex items-center gap-1">

                <Clock3 size={14} />

                <span>Just now</span>

              </div>

              <span>•</span>

              <div className="flex items-center gap-1">

                <Sparkles
                  size={14}
                  className="text-cyan-400"
                />

                <span>Public</span>

              </div>

            </div>

          </div>

        </div>

        <button className="rounded-xl p-2 text-slate-500 transition hover:bg-white/5 hover:text-white">
          <MoreHorizontal size={20} />
        </button>

      </div>

      {/* Content */}

      <div className="px-7 py-7">

        <p className="whitespace-pre-wrap text-[16px] leading-8 text-slate-200">
          {post.content}
        </p>

      </div>

      {/* Stats */}

      <div className="flex items-center justify-between border-t border-b border-white/10 px-7 py-4">

        <div className="flex items-center gap-6">

          <span className="text-sm text-slate-400">
            <strong className="text-white">
              {post.likes?.length || 0}
            </strong>{" "}
            Likes
          </span>

          <span className="text-sm text-slate-400">
            <strong className="text-white">
              {post.comments?.length || 0}
            </strong>{" "}
            Comments
          </span>

        </div>

      </div>

      {/* Actions */}

      <div className="grid grid-cols-2 gap-3 px-7 py-5">

        <button
          onClick={() => likePost(post._id)}
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0B1220] py-3 text-slate-300 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
        >
          <Heart size={18} />

          <span className="font-medium">
            Like
          </span>
        </button>

        <button
          className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#0B1220] py-3 text-slate-300 transition-all duration-200 hover:border-cyan-500/40 hover:bg-cyan-500/10 hover:text-cyan-400"
        >
          <MessageCircle size={18} />

          <span className="font-medium">
            Comment
          </span>
        </button>

      </div>

      {/* Comments */}
            <div className="space-y-4 px-7 py-6">

        {post.comments?.length > 0 ? (
          post.comments.map((comment) => (
            <div
              key={comment._id}
              className="rounded-2xl border border-white/10 bg-[#0B1220] p-4 transition hover:border-cyan-500/30"
            >
              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 font-semibold text-cyan-300">
                  {comment.user?.name?.charAt(0).toUpperCase()}
                </div>

                <div className="flex-1">

                  <div className="flex items-center gap-2">

                    <h4 className="font-semibold text-white">
                      {comment.user?.name}
                    </h4>

                    <span className="text-xs text-slate-500">
                      • Just now
                    </span>

                  </div>

                  <p className="mt-2 leading-7 text-slate-300">
                    {comment.text}
                  </p>

                </div>

              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 py-8 text-center">
            <MessageCircle
              size={26}
              className="mx-auto text-slate-500"
            />

            <p className="mt-3 text-sm text-slate-500">
              No comments yet. Start the discussion.
            </p>
          </div>
        )}

      </div>

      {/* Add Comment */}

      <div className="border-t border-white/10 bg-[#0F172A]/40 px-7 py-6">

        <div className="flex items-center gap-4">

          <input
            value={commentText[post._id] || ""}
            onChange={(e) =>
              setCommentText((prev) => ({
                ...prev,
                [post._id]: e.target.value,
              }))
            }
            placeholder="Write a thoughtful comment..."
            className="flex-1 rounded-2xl border border-white/10 bg-[#111827] px-5 py-4 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
          />

          <button
            onClick={() => addComment(post._id)}
            className="flex items-center gap-2 rounded-2xl bg-cyan-500 px-6 py-4 font-semibold text-[#07131E] transition-all duration-200 hover:scale-[1.03] hover:bg-cyan-400 active:scale-100"
          >
            <Send size={18} />

            Send
          </button>

        </div>

      </div>

    </article>
  );
}

export default FeedPostCard;