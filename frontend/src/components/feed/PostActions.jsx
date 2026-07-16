import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";

function PostActions({
  post,
  likePost,
}) {
  return (
    <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">

      <div className="flex gap-2">

        <button
          onClick={() => likePost(post._id)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 transition hover:bg-[#1F2937]"
        >
          <Heart
            size={18}
            className="text-pink-400"
          />

          <span>
            {post.likes?.length || 0}
          </span>
        </button>

        <button
          className="flex items-center gap-2 rounded-xl px-4 py-2 transition hover:bg-[#1F2937]"
        >
          <MessageCircle size={18} />

          <span>
            {post.comments?.length || 0}
          </span>
        </button>

      </div>

      <div className="flex gap-2">

        <button
          className="rounded-xl p-2 transition hover:bg-[#1F2937]"
        >
          <Bookmark size={18} />
        </button>

        <button
          className="rounded-xl p-2 transition hover:bg-[#1F2937]"
        >
          <Share2 size={18} />
        </button>

      </div>

    </div>
  );
}

export default PostActions;