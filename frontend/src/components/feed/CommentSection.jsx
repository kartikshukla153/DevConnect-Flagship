function CommentSection({
  post,
  commentText,
  setCommentText,
  addComment,
}) {
  return (
    <div className="mt-6">

      <h4 className="mb-4 font-semibold text-white">
        Comments
      </h4>

      <div className="space-y-3">

        {post.comments?.map((comment, index) => (
          <div
            key={index}
            className="rounded-xl bg-[#0B1220] p-4"
          >
            <p className="font-semibold text-cyan-400">
              {comment.user?.name || "Developer"}
            </p>

            <p className="mt-2 text-gray-300">
              {comment.text}
            </p>
          </div>
        ))}

      </div>

      <div className="mt-5 flex gap-3">

        <input
          value={commentText[post._id] || ""}
          onChange={(e) =>
            setCommentText((prev) => ({
              ...prev,
              [post._id]: e.target.value,
            }))
          }
          placeholder="Write a comment..."
          className="flex-1 rounded-xl border border-white/10 bg-[#0B1220] p-3 outline-none focus:border-cyan-400"
        />

        <button
          onClick={() => addComment(post._id)}
          className="rounded-xl bg-cyan-400 px-5 font-semibold text-black"
        >
          Send
        </button>

      </div>

    </div>
  );
}
export default CommentSection;