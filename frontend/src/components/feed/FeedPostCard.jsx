import { Heart, MessageCircle, Clock } from "lucide-react";

function FeedPostCard({
  post,
  likePost,
  commentText,
  setCommentText,
  addComment,
}) {
  return (
    <div className="rounded-2xl border border-[#374151] bg-[#111827] p-6 mb-6 hover:border-cyan-500 transition">

      <div className="flex items-center gap-4">

        <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold">
          {post.user?.name?.charAt(0)}
        </div>

        <div>

          <h3 className="font-semibold">
            {post.user?.name}
          </h3>

          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock size={14} />
            Just now
          </div>

        </div>

      </div>

      <p className="mt-6 leading-8 text-gray-200">
        {post.content}
      </p>

      <div className="flex gap-4 mt-6">

        <button
          onClick={() => likePost(post._id)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#1F2937]"
        >
          <Heart size={18} />
          {post.likes?.length || 0}
        </button>

        <button className="flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#1F2937]">
          <MessageCircle size={18} />
          {post.comments?.length || 0}
        </button>

      </div>

      <div className="mt-6">

        {post.comments?.map((comment) => (
          <div
            key={comment._id}
            className="mb-3 rounded-xl bg-[#1F2937] p-3"
          >
            <strong>
              {comment.user?.name}
            </strong>

            <p className="mt-1 text-gray-300">
              {comment.text}
            </p>
          </div>
        ))}

        <div className="flex gap-3 mt-4">

          <input
            value={commentText[post._id] || ""}
            onChange={(e) =>
              setCommentText((prev) => ({
                ...prev,
                [post._id]: e.target.value,
              }))
            }
            placeholder="Write a comment..."
            className="flex-1 rounded-xl bg-[#0B1220] border border-[#374151] px-4 py-3 outline-none"
          />

          <button
            onClick={() => addComment(post._id)}
            className="rounded-xl bg-cyan-400 text-black px-5 font-semibold"
          >
            Send
          </button>

        </div>

      </div>

    </div>
  );
}

export default FeedPostCard;