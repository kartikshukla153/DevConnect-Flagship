import { useState } from "react";
import { Image, SendHorizontal } from "lucide-react";

function CreatePostCard({ onCreatePost }) {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (!content.trim()) return;

    onCreatePost(content);
    setContent("");
  };

  return (
    <div className="bg-[#111827] border border-[#374151] rounded-2xl p-6 shadow-lg animate-fadeIn">

      <div className="flex items-start gap-4">

        <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-black font-bold text-lg">
          K
        </div>

        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share something with developers..."
          className="flex-1 bg-transparent resize-none outline-none text-white placeholder:text-gray-500 text-[15px]"
        />

      </div>

      <div className="flex justify-between items-center mt-6">

        <button
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[#374151] hover:bg-[#1F2937] transition"
        >
          <Image size={18} />
          Media
        </button>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-3 rounded-xl font-semibold transition"
        >
          <SendHorizontal size={18} />
          Publish
        </button>

      </div>

    </div>
  );
}

export default CreatePostCard;