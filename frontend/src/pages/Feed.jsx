import { useEffect, useState } from "react";
import axios from "axios";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [commentText, setCommentText] = useState({});

  const token = localStorage.getItem("token");

  const fetchPosts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("POST RESPONSE:", res.data);

      setPosts(res.data.posts || []);
    } catch (err) {
      console.log("FETCH ERROR:", err.response?.data);
      setPosts([]);
    }
  };

  const createPost = async () => {
    try {
      if (!content.trim()) return;

      await axios.post(
        "http://localhost:5000/api/posts",
        { content },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setContent("");
      fetchPosts();
    } catch (err) {
      console.log("CREATE ERROR:", err.response?.data);
    }
  };

  const likePost = async (postId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/posts/like/${postId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      fetchPosts();
    } catch (err) {
      console.log("LIKE ERROR:", err.response?.data);
    }
  };

  const addComment = async (postId) => {
    try {
      const text = commentText[postId];

      if (!text?.trim()) return;

      await axios.post(
        `http://localhost:5000/api/posts/comment/${postId}`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setCommentText((prev) => ({
        ...prev,
        [postId]: "",
      }));

      fetchPosts();
    } catch (err) {
      console.log("COMMENT ERROR:", err.response?.data);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-[#070A12] text-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">DevConnect Feed</h1>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            window.location.href = "/login";
          }}
          className="bg-red-500 px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>

      <div className="mb-6">
        <textarea
          className="w-full p-3 rounded bg-gray-800"
          rows="4"
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <button
          onClick={createPost}
          className="mt-2 bg-cyan-500 text-black px-4 py-2 rounded"
        >
          Create Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p className="text-gray-400">No posts yet.</p>
      ) : (
        posts.map((post) => (
          <div
            key={post._id}
            className="border border-gray-700 rounded p-4 mb-5"
          >
            <h3 className="font-bold">
              {post.user?.name || "Unknown User"}
            </h3>

            <p className="mt-2">{post.content}</p>

            <button
              onClick={() => likePost(post._id)}
              className="mt-3 bg-pink-500 text-black px-3 py-1 rounded"
            >
              ❤️ Like ({post.likes?.length || 0})
            </button>

            <div className="mt-5">
              <h4 className="font-semibold mb-2">Comments</h4>

              {post.comments?.map((comment, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-2 rounded mb-2"
                >
                  <strong>{comment.user?.name || "User"}:</strong>{" "}
                  {comment.text}
                </div>
              ))}

              <div className="flex gap-2 mt-2">
                <input
                  className="flex-1 p-2 rounded bg-gray-800"
                  placeholder="Write comment..."
                  value={commentText[post._id] || ""}
                  onChange={(e) =>
                    setCommentText((prev) => ({
                      ...prev,
                      [post._id]: e.target.value,
                    }))
                  }
                />

                <button
                  onClick={() => addComment(post._id)}
                  className="bg-cyan-500 text-black px-4 rounded"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default Feed;